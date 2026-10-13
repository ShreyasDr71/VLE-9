const http = require('http');

// Config comes from environment variables, never hardcoded in the source.
const PORT = process.env.PORT || 3000;
const DB_PASSWORD = process.env.DB_PASSWORD; // injected from the Kubernetes Secret

// Input validation: letters and spaces only, 1-30 characters.
const NAME_PATTERN = /^[A-Za-z ]{1,30}$/;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('Cache-Control', 'no-store');

  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/') {
    res.writeHead(200);
    return res.end('DevSecOps demo app. Try /greet?name=Alice\n');
  }

  if (url.pathname === '/greet') {
    const name = url.searchParams.get('name') || '';
    if (!NAME_PATTERN.test(name)) {
      res.writeHead(400);
      return res.end('Invalid name: use 1-30 letters and spaces only\n');
    }
    res.writeHead(200);
    return res.end(`Hello, ${name}!\n`);
  }

  if (url.pathname === '/health') {
    res.writeHead(200);
    return res.end(DB_PASSWORD ? 'ok (secret loaded)\n' : 'ok (no secret)\n');
  }

  res.writeHead(404);
  res.end('Not found\n');
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
