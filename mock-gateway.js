const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/v1/chat/completions') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('Received request on Mock OmniRoute Gateway:', body);
      const responsePayload = {
        id: 'chatcmpl-mock',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'gemini-3.6-flash',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '<div>Mock HTML from OmniRoute Gateway</div>'
            },
            finish_reason: 'stop'
          }
        ],
        usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(responsePayload));
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Mock OmniRoute Gateway is running on http://localhost:${PORT}`);
});
