import glob, gzip, re, json, datetime
from collections import Counter

now = datetime.datetime.now(datetime.timezone.utc)
date_24h = (now - datetime.timedelta(days=1)).strftime('%d/%b/%Y')
date_7d = set([(now - datetime.timedelta(days=i)).strftime('%d/%b/%Y') for i in range(7)])
date_28d = set([(now - datetime.timedelta(days=i)).strftime('%d/%b/%Y') for i in range(28)])

BOT_PATTERNS = [
    'bot', 'spider', 'crawler', 'curl', 'wget', 'python', 'headless', 'censys', 
    'semrush', 'bytespider', 'ahrefs', 'yandex', 'bingbot', 'googlebot', 'slurp',
    'baiduspider', 'feedfetcher', 'mastodon', 'meta-externalagent', 'facebookexternalhit',
    'discordbot', 'slackbot', 'twitterbot', 'pinterest'
]

# Strict valid affiliate slug regex: /go/hostinger or /go/hostinger/ (strictly alphanumeric + hyphens)
GO_AFFILIATE_REGEX = re.compile(r'^/go/([a-z0-9][a-z0-9-]*)/?$')

# Suspicious/scanner keywords to exclude from landing pages
SCANNER_PATTERNS = [
    '.php', '.env', '.git', '.yaml', '.yml', '.bak', '.sql', '.tar', '.gz',
    'wp-', 'install', 'phpinfo', 'admin', 'docker', 'credentials', 'config'
]

def analyze_logs(file_patterns, domain_name):
    files = sorted(glob.glob(file_patterns))
    windows = {
        '24h': {'hits': 0, 'human_hits': 0, 'human_ips': set(), 'all_ips': set(), 'landing_pages': Counter(), 'stores': Counter(), 'go_clicks': Counter(), 'referrers': Counter(), 'cross_referrals': 0},
        '7d':  {'hits': 0, 'human_hits': 0, 'human_ips': set(), 'all_ips': set(), 'landing_pages': Counter(), 'stores': Counter(), 'go_clicks': Counter(), 'referrers': Counter(), 'cross_referrals': 0},
        '28d': {'hits': 0, 'human_hits': 0, 'human_ips': set(), 'all_ips': set(), 'landing_pages': Counter(), 'stores': Counter(), 'go_clicks': Counter(), 'referrers': Counter(), 'cross_referrals': 0}
    }

    log_line_regex = re.compile(r'^(\S+) \S+ \S+ \[([^:]+):([0-9:]+) \+0000\] "([A-Z]+) (\S+) HTTP[^"]*" (\d+) \d+ "([^"]*)" "([^"]*)"')

    for f in files:
        opener = gzip.open if f.endswith('.gz') else open
        try:
            with opener(f, 'rt', errors='ignore') as fh:
                for line in fh:
                    m = log_line_regex.match(line)
                    if not m:
                        continue
                    ip, date_str, time_str, method, path, status, ref, ua = m.groups()
                    
                    in_24h = date_str in [now.strftime('%d/%b/%Y'), date_24h]
                    in_7d = date_str in date_7d
                    in_28d = date_str in date_28d
                    
                    if not (in_24h or in_7d or in_28d):
                        continue

                    status_code = int(status)
                    # Filter scanner noise: only 200, 301, 302 are valid visits/redirects
                    if status_code not in (200, 301, 302):
                        continue

                    ua_l = ua.lower()
                    is_bot = any(b in ua_l for b in BOT_PATTERNS)

                    active_windows = []
                    if in_24h: active_windows.append('24h')
                    if in_7d:  active_windows.append('7d')
                    if in_28d: active_windows.append('28d')

                    clean_path = path.split('?')[0]
                    go_match = GO_AFFILIATE_REGEX.match(clean_path)

                    is_scanner_path = any(s in clean_path.lower() for s in SCANNER_PATTERNS)

                    for w in active_windows:
                        win = windows[w]
                        win['hits'] += 1
                        win['all_ips'].add(ip)

                        if not is_bot:
                            win['human_hits'] += 1
                            win['human_ips'].add(ip)
                            
                            # Landing pages (HTML/clean routes, excluding scanner noise)
                            if not is_scanner_path and not clean_path.endswith(('.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico', '.css', '.js', '.woff2', '.xml', '.txt', '.json')):
                                win['landing_pages'][clean_path] += 1

                            # Stores pages
                            if '/stores/' in clean_path:
                                store = clean_path.split('/stores/')[1].strip('/')
                                if store and not any(s in store for s in SCANNER_PATTERNS):
                                    win['stores'][store] += 1
                            
                            # Click-outs strictly via regex
                            if go_match:
                                go_target = go_match.group(1)
                                win['go_clicks'][go_target] += 1

                            # Cross-referrals (flirtcheck -> promoradar)
                            if 'flirtcheck' in ref.lower():
                                win['cross_referrals'] += 1

                            # External Referrers
                            if ref and ref != '-' and domain_name not in ref and '178.128.199.28' not in ref:
                                win['referrers'][ref[:90]] += 1

        except Exception as e:
            pass

    results = {}
    for w in ['24h', '7d', '28d']:
        win = windows[w]
        results[w] = {
            'total_requests': win['hits'],
            'total_ips': len(win['all_ips']),
            'human_requests': win['human_hits'],
            'unique_human_visitors': len(win['human_ips']),
            'cross_referrals_from_flirtcheck': win['cross_referrals'],
            'top_landing_pages': win['landing_pages'].most_common(10),
            'top_stores': win['stores'].most_common(10),
            'top_go_clickouts': win['go_clicks'].most_common(10),
            'top_referrers': win['referrers'].most_common(10),
        }
    return results

promoradar_stats = analyze_logs('/var/log/nginx/access.log*', 'promoradar.store')
flirtcheck_stats = analyze_logs('/var/log/nginx/flirtcheck.access.log*', 'flirtcheck.site')

print(json.dumps({
    'generated_utc': now.isoformat(),
    'promoradar': promoradar_stats,
    'flirtcheck': flirtcheck_stats
}))
