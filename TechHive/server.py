#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Adding CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        http.server.SimpleHTTPRequestHandler.end_headers(self)

print(f"Serving TechHive website at http://localhost:{PORT}")
print(f"Demo Users: admin/admin123, john/john2023, sarah/sarah123")
print("Press Ctrl+C to stop the server.")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
