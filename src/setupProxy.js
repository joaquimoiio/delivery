const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      },
      onProxyReq: function(proxyReq, req, res) {
        // Log proxy requests for debugging
        console.log('Proxying:', req.method, req.url, '→', proxyReq.path);
      },
      onError: function(err, req, res) {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
          message: 'Erro ao conectar com o servidor. Por favor, verifique se o servidor está rodando.'
        }));
      }
    })
  );
};
