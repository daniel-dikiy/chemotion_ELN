const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    'http://localhost:8002/v2/indigo', // The endpoint you want to proxy
    createProxyMiddleware({
      target: 'http://localhost:8002', // The URL of your API server
      changeOrigin: true,
    })
  );
};