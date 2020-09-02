//
// @vue/cli-service configuration
// see: https://cli.vuejs.org/config/#global-cli-config
//

// Push the package version and name into the vue app with an environment variable
process.env.VUE_APP_VERSION = require('./package.json').version
process.env.VUE_APP_NAME = require('./package.json').name

// Add an extra import to all sass imports
module.exports = {
  lintOnSave: true,
  chainWebpack: config => {
    // Turn on auto fixing
    config.module
      .rule('eslint')
      .use('eslint-loader')
      .options({ fix: true })
    config.plugin('html').tap(args => {
      args[0].title = process.env.VUE_APP_NAME
      return args
    })
  },

  // load common css styles
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "~@/scss/_common.scss";`
      }
    }
  }
}
