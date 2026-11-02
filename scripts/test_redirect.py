import urllib.request
req = urllib.request.Request(
    'http://127.0.0.1:3000/go?offer=admitad_49070&source=test_check',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', 'Accept-Language': 'en-US'}
)
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None
opener = urllib.request.build_opener(NoRedirect)
try:
    res = opener.open(req)
    print("Code:", res.status)
except Exception as e:
    print("Code:", getattr(e, 'code', None))
    print("Location:", getattr(e, 'headers', {}).get('Location'))
