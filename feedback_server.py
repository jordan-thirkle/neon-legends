"""Neon Legends Feedback Server
Run: python feedback_server.py
Starts a small HTTP server on port 5280 that accepts feedback POSTs
and serves feedback data for AI agents to read.
"""
import http.server, json, os, time
from urllib.parse import urlparse

FEEDBACK_FILE = os.path.join(os.path.dirname(__file__), 'feedback_data.json')

class FeedbackHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        path = urlparse(self.path).path
        if path == '/feedback':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body)
                self._save(data)
                self._ok({'status':'ok'})
            except Exception as e:
                self._err(str(e))
        else:
            self._err('not found', 404)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/feedback':
            self._serve_file(FEEDBACK_FILE)
        elif path == '/health':
            self._ok({'status':'alive','time':time.time()})
        else:
            self._err('not found', 404)

    def _save(self, entry):
        entries = []
        if os.path.exists(FEEDBACK_FILE):
            with open(FEEDBACK_FILE, 'r') as f:
                try: entries = json.load(f)
                except: pass
        entries.append({**entry, 'timestamp': time.time()})
        with open(FEEDBACK_FILE, 'w') as f:
            json.dump(entries, f, indent=2)

    def _ok(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def _err(self, msg, code=400):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'error':msg}).encode())

    def _serve_file(self, path):
        if os.path.exists(path):
            with open(path, 'r') as f:
                data = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(data.encode())
        else:
            self._ok([])

    def log_message(self, fmt, *args):
        pass  # quiet

if __name__ == '__main__':
    port = 5280
    server = http.server.HTTPServer(('127.0.0.1', port), FeedbackHandler)
    print(f'Feedback server on http://127.0.0.1:{port}')
    server.serve_forever()
