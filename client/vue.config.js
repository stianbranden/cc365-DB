// vue.config.js

 module.exports = {
    publicPath: '/vue/',
    outputDir: '../public/vue/' ,
    css: {
      loaderOptions: {
        sass: {
          prependData: `@import "@/scss/_prepend.scss";`
        }
      }
    },
    chainWebpack: config => {
      config.module
        .rule('vue')
        .use('vue-loader')
        .tap(options => ({
          ...options,
          compilerOptions: {
            // treat any tag that starts with ion- as custom elements
            isCustomElement: tag => tag.startsWith('tableau-viz') || tag.startsWith('viz-filter')
          }
        }))
    }
  }