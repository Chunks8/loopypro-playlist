#!/usr/bin/env python3
"""
Playlist refresh script for LoopyPro Radio.
Fetches latest threads from Vanilla Forums API, extracts most recent media per thread,
updates SEED_TRACKS in routes.ts, rebuilds, and pushes to GitHub.
"""
import urllib.request, urllib.parse, json, re, time, subprocess, sys, html as html_module, os
from datetime import datetime, timezone

# Paths relative to the script's own location so this works both locally and in GitHub Actions
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
ROUTES_FILE = os.path.join(PROJECT_DIR, 'server', 'routes.ts')
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'LoopyProRadioBot/1.0'})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())

def strip_blockquotes(html_body):
    """Remove quoted content so we don't pick up media that a member is merely referencing."""
    return re.sub(r'<blockquote[^>]*>.*?</blockquote>', '', html_body, flags=re.DOTALL | re.IGNORECASE)

def get_media(html_body):
    html_body = strip_blockquotes(html_body)
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
    # YouTube iframes (skip videoseries/playlist embeds — no single playable video ID)
    for m in re.finditer(r'src=["\']?(https://www\.youtube\.com/embed/([A-Za-z0-9_-]{11,})[^"\'>\s]*)', html_body):
        vid = m.group(2)
        if vid == 'videoseries' or len(vid) != 11:
            continue
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
    return html_module.unescape(title).strip()

def ts_val(v):
    if v is None: return 'null'
    return json.dumps(str(v))

def fetch_html(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'})
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read().decode('utf-8', errors='ignore')

def get_media_from_html_page(html):
    """Extract media URLs directly from raw forum HTML (not JSON API)."""
    html = strip_blockquotes(html)
    results = []
    # SoundCloud iframes (URL-encoded in src)
    for m in re.finditer(r'src=["\']?(https://w\.soundcloud\.com/player/\?url=([^&"\'>\s]+)[^"\'>\s]*)', html):
        media_url = urllib.parse.unquote(m.group(2))
        embed = urllib.parse.unquote(m.group(1))
        embed = re.sub(r'auto_play=(true|false)', 'auto_play=false', embed)
        if 'auto_play=' not in embed: embed += '&auto_play=false'
        embed = embed.replace('&amp;', '&')
        results.append(('soundcloud', media_url, embed))
    # SoundCloud direct links
    for m in re.finditer(r'href=["\']?(https?://(?:on\.)?soundcloud\.com/[^"\'>\s]+)', html):
        u = m.group(1)
        if '/player' not in u:
            results.append(('soundcloud', u, None))
    # YouTube
    for m in re.finditer(r'data-youtube=["\']?([A-Za-z0-9_-]{11})', html):
        vid = m.group(1)
        results.append(('youtube', f'https://www.youtube.com/watch?v={vid}', f'https://www.youtube.com/embed/{vid}'))
    for m in re.finditer(r'href=["\']?(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})[^"\'>\s]*)', html):
        vid = m.group(2)
        results.append(('youtube', f'https://www.youtube.com/watch?v={vid}', f'https://www.youtube.com/embed/{vid}'))
    # HearThis
    for m in re.finditer(r'href=["\']?(https://hearthis\.at/[^"\'>\s]+)', html):
        u = m.group(1).rstrip('/')
        if '/set/' not in u and u.count('/') >= 3:
            results.append(('hearthis', u, None))
    return results

def get_most_recent_media_from_author(disc_id, insert_user_id, count_comments, author_username=None):
    """
    For long-running threads where the API pagination is unreliable,
    fetch the actual HTML pages from the last page backwards and find
    the most recent post by the thread author that contains media.
    Uses HTML scraping since the Vanilla API returns duplicate pages for some threads.
    """
    if count_comments == 0:
        return None

    # Forum shows 30 comments per page on the web UI
    POSTS_PER_PAGE = 30
    last_page = ((count_comments - 1) // POSTS_PER_PAGE) + 1
    # Use the full slug-based URL if available — without the slug some forums return wrong pages
    if author_username:
        # Fetch the discussion to get its canonical URL
        try:
            disc_data = fetch(f"https://forum.loopypro.com/api/v2/discussions/{disc_id}")
            canonical = disc_data.get('url', '')
            # Strip trailing slash and any /pN suffix, use as base
            base_url = re.sub(r'/p\d+$', '', canonical.rstrip('/'))
        except:
            base_url = f"https://forum.loopypro.com/discussion/{disc_id}"
    else:
        base_url = f"https://forum.loopypro.com/discussion/{disc_id}"

    for page in range(last_page, 0, -1):
        page_url = f"{base_url}/p{page}" if page > 1 else base_url
        try:
            html = fetch_html(page_url)
        except Exception as e:
            print(f"    Warning: failed to fetch HTML page {page}: {e}")
            continue

        # Split HTML into per-post blocks using the AuthorWrap div as delimiter.
        # Each post starts with: <div class="Item-Header CommentHeader">
        # preceded by </div> from the previous post's body.
        # We split on profile links which uniquely mark each post's author.
        # Pattern: href="/profile/{username}" appears twice per post (photo + name link).
        # We split on the opening of each Item-Header block.
        blocks = re.split(r'<div class="Item-Header CommentHeader">', html)
        # blocks[0] = page header, blocks[1..] = one per comment
        for block in reversed(blocks[1:]):
            # Extract author username from this block
            author_match = re.search(r'href="/profile/([^"]+)"\s+class="Username"', block)
            if not author_match:
                continue
            post_author = author_match.group(1).lower()
            # Check if this post is by our target author
            if author_username and post_author != author_username.lower():
                continue
            # Find media in this block
            media = get_media_from_html_page(block)
            if media:
                # Also extract the post datetime so we can use it as fetchedAt
                date_match = re.search(r'datetime="([^"]+)"', block)
                post_date = date_match.group(1) if date_match else None
                return media[-1], post_date

    return None, None

def get_most_recent_media_standard(disc_id, disc_body, insert_user_id=None):
    """
    Standard logic for normal threads: prefer the most recent media posted by
    the thread author (insertUserID). Falls back to any member's most recent
    media if the author has none in the comments.
    """
    # Start with OP body media
    op_media = get_media(disc_body)

    try:
        comments = fetch(
            f"https://forum.loopypro.com/api/v2/comments"
            f"?discussionID={disc_id}&limit=50&sort=-dateInserted"
        )
        # Scan all comments, tracking the last-seen media from the author
        # and the last-seen media from anyone (API sort order is unreliable).
        author_media = None
        any_media = None
        for c in comments:
            media = get_media(c.get('body', ''))
            if not media:
                continue
            any_media = media  # keep updating — last one wins
            if insert_user_id and c.get('insertUserID') == insert_user_id:
                author_media = media  # keep updating — last one wins

        # Prefer author's most recent, else most recent from anyone, else OP
        chosen = author_media or any_media
        if chosen:
            return chosen[-1]
    except Exception as e:
        print(f"    Warning: failed to fetch comments: {e}")

    if not op_media:
        return None
    return op_media[-1]

def main():
    print(f"[{datetime.now().isoformat()}] Starting playlist refresh...")

    # Fetch discussions sorted by post date (newest first)
    discs = fetch("https://forum.loopypro.com/api/v2/discussions?categoryID=3&limit=70&sort=-dateInserted")
    print(f"  Fetched {len(discs)} discussions")

    # Threads to skip entirely
    # SKIP_EXACT: full title match
    SKIP_EXACT = ['Music by Forum Members', 'Creations & Collaborations Are Now Combined']
    # SKIP_PREFIXES: title starts with
    SKIP_PREFIXES = ['Song Of The Month Club', 'Song of the Month Club']
    # SKIP_CONTAINS: title contains all listed words (case-insensitive) — multi-participant challenges
    SKIP_CONTAINS = [
        ['challenge', 'edition'],   # e.g. "Korg Gadget LE Challenge, 2026 Edition"
    ]

    # Long-running threads where only the original author posts tracks.
    # For these, we paginate to the last HTML page and find the author's most recent media.
    # Key: insertUserID, Value: function that returns True if the thread title matches
    # the long-running pattern (so individual EP/album threads by the same user are excluded).
    MONTHS = ['january','february','march','april','may','june',
              'july','august','september','october','november','december']

    def is_jwm_monthly(title):
        """JWM monthly threads contain his name, a month, and a year — but not 'JWM - ' single-track format."""
        t = title.lower()
        return (t.startswith('jwm') and
                not t.startswith('jwm -') and
                any(m in t for m in MONTHS) and
                bool(re.search(r'20\d\d', t)))

    AUTHOR_ONLY_RULES = {
        22715: lambda title: True,          # wagtunes — all threads are long-running series
        3108:  is_jwm_monthly,              # JWM — monthly threads only, not individual tracks
    }

    user_cache = {}
    tracks = []
    seen_urls = set()

    for d in discs:
        title = html_module.unescape(d['name'])

        # Skip admin/pinned threads
        if title in SKIP_EXACT:
            continue

        # Skip Song of the Month Club threads entirely
        if any(title.startswith(pfx) for pfx in SKIP_PREFIXES):
            print(f"  Skipping SOTM thread: {title}")
            continue

        # Skip multi-participant challenge/contest threads
        title_lower = title.lower()
        if any(all(w in title_lower for w in words) for words in SKIP_CONTAINS):
            print(f"  Skipping challenge thread: {title}")
            continue

        disc_id = d['discussionID']
        insert_user_id = d['insertUserID']
        date = d['dateInserted']
        thread_url = d['url']
        body = d.get('body', '')
        count_comments = d.get('countComments', 0)

        # Get username from per-discussion endpoint (list endpoint returns numeric IDs)
        try:
            if disc_id not in user_cache:
                dd = fetch(f"https://forum.loopypro.com/api/v2/discussions/{disc_id}")
                insert_user = dd.get('insertUser', {})
                user_cache[disc_id] = insert_user.get('name') or str(insert_user_id)
        except:
            user_cache[disc_id] = str(insert_user_id)
        username = user_cache[disc_id]

        # Choose media extraction strategy
        author_only_rule = AUTHOR_ONLY_RULES.get(insert_user_id)
        post_date = None  # will be set for author-only threads
        if author_only_rule and author_only_rule(title):
            # Long-running thread: only look at posts by the thread author,
            # paginate from the end to find their most recent track
            print(f"  Author-only mode for: {title} ({count_comments} comments)")
            result, post_date = get_most_recent_media_from_author(disc_id, insert_user_id, count_comments, author_username=username)
            if result is None:
                # Fall back to OP body
                body_media = get_media(body)
                result = body_media[-1] if body_media else None
            if result is None:
                print(f"    No media found, skipping")
                continue
            mtype, murl, embed = result
        else:
            # Standard thread: most recent media from OP + most recent comment
            result = get_most_recent_media_standard(disc_id, body, insert_user_id=insert_user_id)
            if result is None:
                continue
            mtype, murl, embed = result

        # Deduplicate by media URL (strip query params for SC short URLs)
        url_key = murl.split('?')[0].split('&')[0]
        if url_key in seen_urls:
            print(f"  Duplicate URL, skipping: {title}")
            continue
        seen_urls.add(url_key)

        # Build embed if missing
        if embed is None and mtype == 'soundcloud':
            resolved = murl
            if 'on.soundcloud.com' in murl:
                try:
                    req2 = urllib.request.Request(murl, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req2, timeout=10) as r2:
                        resolved = r2.url
                except:
                    pass
            encoded = urllib.parse.quote(resolved, safe='')
            embed = f"https://w.soundcloud.com/player/?url={encoded}&color=ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false"
        elif embed is None and mtype == 'hearthis':
            try:
                req3 = urllib.request.Request(murl, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req3, timeout=10) as r3:
                    body3 = r3.read().decode('utf-8', errors='ignore')
                m3 = re.search(r'embed/(\d+)', body3)
                if m3:
                    embed = f"https://app.hearthis.at/embed/{m3.group(1)}/transparent_black/?"
            except:
                pass

        tracks.append({
            'songTitle': clean_title(title),
            'artistName': username,
            'forumMember': username,
            'mediaUrl': murl,
            'mediaType': mtype,
            'threadUrl': thread_url,
            'embedCode': embed,
            # For long-running threads, use the post date of the author's most recent
            # media comment so the thread sorts to the top when they add a new creation.
            'fetchedAt': post_date or date,
        })
        print(f"  + {title} [{mtype}] {murl[:60]}")
        time.sleep(0.1)

    tracks.sort(key=lambda t: t['fetchedAt'], reverse=True)
    print(f"  Total tracks: {len(tracks)}")

    # Build new SEED_TRACKS block
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

    # When running inside GitHub Actions, skip build and push —
    # the workflow handles those steps itself after this script exits.
    in_actions = os.environ.get('GITHUB_ACTIONS') == 'true'

    if in_actions:
        print("  Running in GitHub Actions — skipping build and push (workflow handles these)")
        print(f"[{datetime.now().isoformat()}] Done.")
        return

    # Build
    result = subprocess.run(['npm', 'run', 'build'], cwd=PROJECT_DIR, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  BUILD FAILED: {result.stderr[-500:]}")
        sys.exit(1)
    print("  Build successful")

    # Push to GitHub
    subprocess.run(['git', 'config', 'user.email', 'gaubie@gmail.com'], cwd=PROJECT_DIR)
    subprocess.run(['git', 'config', 'user.name', 'LoopyPro Radio Bot'], cwd=PROJECT_DIR)
    remote = f"https://Chunks8:{GITHUB_TOKEN}@github.com/Chunks8/loopypro-playlist.git"
    subprocess.run(['git', 'remote', 'set-url', 'origin', remote], cwd=PROJECT_DIR)
    subprocess.run(['git', 'add', '-A'], cwd=PROJECT_DIR)
    subprocess.run(['git', 'commit', '-m', f'Playlist refresh {datetime.now().strftime("%Y-%m-%d %H:%M")}'], cwd=PROJECT_DIR)
    push = subprocess.run(['git', 'push', 'origin', 'main'], cwd=PROJECT_DIR, capture_output=True, text=True)
    if push.returncode != 0:
        print(f"  PUSH FAILED: {push.stderr}")
        sys.exit(1)
    print("  Pushed to GitHub — Render will auto-deploy")
    print(f"[{datetime.now().isoformat()}] Done.")

if __name__ == '__main__':
    main()
