const Compiler = require('./compiler')

function webpack(options) {
  const mergeOption = _mergeOptions(options)
  console.log('mergeOPtions:', mergeOption)
  const compiler = new Compiler(mergeOption)
  _loadPlugin(options.plugins, compiler)
  return compiler
}

function _mergeOptions(options) {
  const shellOption = process.argv.slice(2).reduce((option, argv) => {
    const [key, value] = argv.split('=')
    if (key && value) {
      option[key.slice(2)] = value
    }
    return option
  }, {})

  return {...options, ...shellOption}
}

function _loadPlugin(plugins, compiler) {
  if (plugins && Array.isArray(plugins)) {
    plugins.forEach(plugin => {
      plugin.apply(compiler)
    })
  }
}

module.exports = webpack