// vue.config.js

 module.exports = {
    publicPath: '/vue/',
    outputDir: 'vue/' ,
    css: {
      loaderOptions: {
        sass: {
          prependData: `@import "@/scss/_prepend.scss";`
        }
      }
    }
  }