//const path = require('path');
module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /config.*config\.js$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '/js/config/config.js'
              },
            },
            {
              loader: 'file-loader',
              options: {
                name: '/js/snowplow.js'
              }
            }
          ]
        }
      ]
    },
    performance: {
      hints: false
    },
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000
      }
    }
  },
  devServer: {
    port:8083,
    proxy: 
    {
      ...['/api'].reduce(
        (acc, ctx) => ({
          ...acc,
          [ctx]: {
            target: 'http://localhost:8082',
            changeOrigin: true,
            ws: false
          }
        }),
        {}
      ),
    }
  },
  transpileDependencies: ['vuetify'],
  publicPath: '/'
};
