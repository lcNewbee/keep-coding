
const fs = require('fs')

function toUnixPath(path) {
  return path.replace(/\\/g, '/')
}

function tryExtensions(
  modulePath,
  extensions,
  originModulePath,
  moduleContext
) {
  extensions.unshift('')
  for (let extension of extensions) {
    if (fs.existsSync(modulePath + extension)) {
      return modulePath + extension
    }
  }

  throw new Error(`No module, Error: Can't resolve ${originModulePath} in  ${moduleContext}`)
}


module.exports = {
  toUnixPath,
  tryExtensions
}