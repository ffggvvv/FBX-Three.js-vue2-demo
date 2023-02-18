const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
    css: {
        loaderOptions: {
            // postcss: {
            //     plugins: [
            //         require('postcss-pxtorem')({
            //             rootValue: 37.5, // 换算的基数(设计图375的根字体为37.5)
            //             propList: ['*']
            //         })
            //     ]
            // }
        }
    },
    configureWebpack: {
        resolve: {
          alias: {
            // eslint-disable-next-line no-undef
            '@': resolve('src'),
          },
        },
    },
    publicPath: './',
    assetsDir: 'static',
    parallel: false,
    devServer: {
        disableHostCheck: true,
        proxy: {
          '/api': {
            target:'http://redlives.cn:4500', 
            // secure: false, // 如果是https接口，需要配置这个参数
            changeOrigin:true,
            pathRewrite:{
              '^/api': ''
            }
          }
        },
    }
  }