#!/usr/bin/env python3
"""
Daily playlist refresh script for LoopyPro Radio.
Fetches latest threads from Vanilla Forums API, extracts most recent media per thread,
updates SEED_TRACKS in routes.ts, rebuilds, and pushes to GitHub.
"""
import urllib.request, urllib.parse, json, re, time, subprocess, sys, html as html_module
from datetime import datetime

ROUTES_FILE = '/home/user/workspace/loopypro-radio/server/routes.ts'
PROJECT_DIR = '/home/user/workspace/loopypro-radio'
import os
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'LoopyProRadioBot/1.0'})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())

def get_media(html_body):
    results = []
    # SoundCloud iframes
    for m in re.finditer(r'src=["\']?(https://w\.soundcloud\.com/player/\?url=[^"\'>\s]+)', html_body):
        url_param = re.search(r'url=([^&"\'>\s]+)', m.group(1))
        if url_param:
            media_url = urllib.parse.unquote(url_param.group(1))
            embed = m.group(1)
            embed = re.sub(r'auto_play=(true|false)', 'auto_play=false', embed)
            if 'auto_play=' not in embed: embed += '&auto_play=false'
            embed = embed.replace('&visual=true','').replace('visual=true&','')
            results.append(('soundcloud', media_url, embed))
    # SoundCloud direct links
    for m in re.finditer(r'href=["\']?(https?://(?:on\.)?soundcloud\.com/[^"\'>\s]+)', html_body):
        u = m.group(1)
        if '/player' not in u:
            results.append(('soundcloud', u, None))
    # YouTube via data-youtube
    for m in re.finditer(r'data-youtube=["\']?([A-Za-z0-9_-]{11})', html_body):
        vid = m.group(1)
        results.append(('youtube', f'https://www.youtube.com/watch?v={vid}',
                        f'https://www.youtube.com/embed/{vid}'))
    # YouTube iframes
    for m in re.finditer(r'src=["\']?(https://www\.youtube\.com/embed/([A-Za-z0-9_-]{11})[^"\'>\s]*)', html_body):
        vid = m.group(2)
        results.append(('youtube', f'https://www.youtube.com/watch?v={vid}',
                        f'https://www.youtube.com/embed/{vid}'))
    # YouTube links
    for m in re.finditer(r'href=["\']?(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})[^"\'>\s]*)', html_body):
        vid = m.group(2)
        results.append(('youtube', f'https://www.youtube.com/watch?v={vid}',
                        f'https://www.youtube.com/embed/{vid}'))
    # HearThis
    for m in re.finditer(r'href=["\']?(https://hearthis\.at/[^"\'>\s]+)', html_body):
        u = m.group(1).rstrip('/')
        if '/set/' not in u and u.count('/') >= 3:
            results.append(('hearthis', u, None))
    return results

def clean_title(title):
    title = html_module.unescape(title).strip()
    m = re.match(r'^[\u201c"](.*?)[\u201d"]\s*(.*)$', title)
    if m:
        title = m.group(1).strip()
    return title

def ts_val(v):
    if v is None: return 'null'
    return json.dumps(str(v))

def main():
    print(f"[{datetime.now().isoformat()}] Starting playlist refresh...")

    # Fetch discussions sorted by post date
    discs = fetch("https://forum.loopypro.com/api/v2/discussions?categoryID=3&limit=35&sort=-dateInserted")
    print(f"  Fetched {len(discs)} discussions")

    # Skip pinned/admin threads
    SKIP = ['Music by Forum Members', 'Creations & Collaborations Are Now Combined']

    user_cache = {}
    def get_username(uid):
        if uid not in user_cache:
            try:
                u = fetch(f"https://forum.loopypro.com/api/v2/users/{uid}")
                user_cache[uid] = u.get('name') or str(uid)
            except:
                user_cache[uid] = str(uid)
        return user_cache[uid]

    tracks = []
    seen_urls = set()

    for d in discs:
        title = html_module.unescape(d['name'])
        if title in SKIP:
            continue

        disc_id = d['discussionID']
        date = d['dateInserted']
        user_id = d['insertUserID']
        thread_url = d['url']
        body = d.get('body', '')

        all_media = get_media(body)

        # Fetch most recent comment with media
        try:
            comments = fetch(f"https://forum.loopypro.com/api/v2/comments?discussionID={disc_id}&limit=50&sort=-dateInserted")
            for c in comments:
                media = get_media(c.get('body', ''))
                if media:
                    all_media.extend(media)
                    break
        except:
            pass

        if not all_media:
            continue

        mtype, murl, embed = all_media[-1]

        # Deduplicate by media URL
        if murl in seen_urls:
            continue
        seen_urls.add(murl)

        username = get_username(user_id)
        tracks.append({
            'songTitle': clean_title(title),
            'artistName': username,
            'forumMember': username,
            'mediaUrl': murl,
            'mediaType': mtype,
            'threadUrl': thread_url,
            'embedCode': embed,
            'fetchedAt': date,
        })
        time.sleep(0.1)

    tracks.sort(key=lambda t: t['fetchedAt'], reverse=True)
    print(f"  Found {len(tracks)} tracks")

    # Build new SEED_TRACKS
    lines = ['const SEED_TRACKS: InsertTrack[] = [']
    for i, t in enumerate(tracks):
        comma = ',' if i < len(tracks)-1 else ''
        lines.append('  {')
        for k in ['songTitle','artistName','forumMember','mediaUrl','mediaType','threadUrl','embedCode','fetchedAt']:
            v = t[k]
            lines.append(f'    {k}: {"null" if v is None else ts_val(v)},')
        lines.append(f'  }}{comma}')
    lines.append('];')
    new_seed = '\n'.join(lines)

    with open(ROUTES_FILE, 'r') as f:
        content = f.read()
    start = content.find('const SEED_TRACKS: InsertTrack[] = [')
    end = content.find('];', start) + 2
    content = content[:start] + new_seed + content[end:]
    with open(ROUTES_FILE, 'w') as f:
        f.write(content)

    print("  Updated routes.ts")

    # Build
    result = subprocess.run(['npm', 'run', 'build'], cwd=PROJECT_DIR, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  BUILD FAILED: {result.stderr[-500:]}")
        sys.exit(1)
    print("  Build successful")

    # Push to GitHub
    env_with_token = {
        'GIT_ASKPASS': 'echo',
        'GIT_USERNAME': 'Chunks8',
        'GIT_PASSWORD': GITHUB_TOKEN,
        'HOME': '/root',
        'PATH': '/usr/bin:/bin:/usr/local/bin'
    }
    subprocess.run(['git', 'add', '-A'], cwd=PROJECT_DIR)
    subprocess.run(['git', 'commit', '-m', f'Daily playlist refresh {datetime.now().strftime("%Y-%m-%d")}'], cwd=PROJECT_DIR)
    push = subprocess.run(['git', 'push', 'origin', 'main'], cwd=PROJECT_DIR, capture_output=True, text=True)
    if push.returncode != 0:
        print(f"  PUSH FAILED: {push.stderr}")
        sys.exit(1)
    print("  Pushed to GitHub — Render will auto-deploy")
    print(f"[{datetime.now().isoformat()}] Done.")

if __name__ == '__main__':
    main()
