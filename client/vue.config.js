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
    }
  }