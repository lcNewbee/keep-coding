class PluginB {
  apply(compiler) {
    compiler.hooks.done.tap('PluginB', () => {
      console.log('PluginB')
    })
  }
}

module.exports = PluginB