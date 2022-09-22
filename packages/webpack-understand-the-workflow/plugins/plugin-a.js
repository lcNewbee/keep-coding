class PluginA {

  apply(compiler) {
    compiler.hooks.run.tap('PluginA', () => {
      console.log('PluginA')
    })
  }
}

module.exports = PluginA