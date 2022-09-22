const { SyncHook } = require('tapable')
const { toUnixPath, tryExtensions } = require('./utils')
const path = require('path')
const fs = require('fs')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default
const t = require('@babel/types')

class Compiler {
  constructor(options) {
    this.options = options
    this.rootPath = this.options.context || toUnixPath(process.cwd())
    this.hooks = {
      run: new SyncHook(),
      emit: new SyncHook(),
      done: new SyncHook()
    }
    this.entries = new Set()
    this.modules = new Set()
    this.chunks = new Set()
    this.assets = new Map()
    this.files = new Set()
  }

  run(callback) {
    this.hooks.run.call()
    const entry = this.getEntry()
    this.buildEntryModule(entry)
    this.exportFile(callback)
  }

  getEntry() {
    let entry = Object.create(null)
    const { entry: optionEntry } = this.options
    if (typeof optionEntry === 'string') {
      entry['main'] = optionEntry
    } else {
      entry = optionEntry
    }

    Object.keys(entry).forEach(key => {
      const value = entry[key]
      if (!path.isAbsolute(value)) {
        entry[key] = toUnixPath(path.join(this.rootPath, value))
      }
    })

    return entry
  }

  buildEntryModule(entry) {
    Object.keys(entry).forEach(name => {
      const entryPath = entry[name]
      const entryObj = this.buildModule(name, entryPath)
      this.entries.add(entryObj)
      this.buildChunk(name, entryObj)
    })
    console.dir('this.entries:', this.entries)
    console.dir('this.modules:', this.modules)
    console.dir('this.chunks:', this.chunks)
  }

  buildChunk(entryName, entryObj) {
    const chunk = {
      name: entryName,
      entryModule: entryObj,
      modules: Array.from(this.modules).filter(md => md.name.includes(entryName))
    }

    this.chunks.add(chunk)
  }

  buildModule(moudleName, moudlePath) {
    const originSourceCode = (this.originSourceCode = fs.readFileSync(moudlePath, 'utf-8'))
    this.moduleCode = this.originSourceCode
    this.handleLoader(moudlePath)
    const module = this.handleWebpackCompiler(moudleName, moudlePath)
    return module
  }

  handleWebpackCompiler(entryName, moudlePath) {
    const moduleId = './' + path.posix.relative(this.rootPath, moudlePath)
    const module = {
      id: moduleId,
      dependences: new Set(),
      name: [entryName]
    }

    const ast = parser.parse(this.moduleCode, {sourceType: 'module'})

    traverse(ast, {
      CallExpression: (nodePath) => {
        const node = nodePath.node
        if (node.callee.name === 'require') {
          const moduleName = node.arguments[0].value
          const moduleDirName = path.posix.dirname(moudlePath)
          // require路径可能没有后缀，该函数根据extensions配置依次尝试匹配后缀
          const absolutePath = tryExtensions(
            path.posix.join(moduleDirName, moduleName),
            this.options.resolve.extensions,
            moduleName,
            moduleDirName
          )

          const moduleId = './' + path.posix.relative(this.rootPath, absolutePath)

          // 修改ast节点
          node.callee = t.identifier('__webpack__require__')
          node.arguments = [t.stringLiteral(moduleId)]
          
          const alreadyModules = Array.from(this.modules).map(it => it.id)
          if (!alreadyModules.includes(moduleId)) {
            module.dependences.add(moduleId)
          } else {
            this.modules.forEach(md => {
              if (md.id === moduleId) {
                md.name.push(entryName)
              }
            })
          }
        }
      }
    })

    const { code } = generate(ast)

    module._source = code
    module.dependences.forEach(dep => {
      const depModule = this.buildModule(entryName, dep)
      this.modules.add(depModule)
    })
    return module
  }

  handleLoader(moudlePath) {
    const matchedLoaders = []
    const rules = this.options.module.rules
    rules.forEach(rule => {
      if (rule.test.test(moudlePath)) {
        if (rule.loader) {
          matchedLoaders.push(rule.loader)
        } else {
          matchedLoaders.push(...rule.use)
        }
      }
    })

    for (let i = 0; i < matchedLoaders.length; i++) {
      const loaderFn = require(matchedLoaders[i])
      this.moduleCode = loaderFn(this.moduleCode)
    }
  }

  exportFile(callback) {
    const output = this.options.output
    this.chunks.forEach(chunk => {
      const parsedFilename = output.filename.replace('[name]', chunk.name)
      this.assets.set(parsedFilename, this.getSourceCode(chunk))
    })
    this.hooks.emit.call()
    if (!fs.existsSync(output.path)) {
      fs.mkdirSync(output.path)
    }

    this.assets.forEach((asset, filename) => {
      const filePath = path.join(output.path, filename)
      fs.writeFileSync(filePath, asset)
    })

    this.hooks.done.call()

    callback(null, {
      toJson: () => {
        return {
          entries: this.entries,
          modules: this.modules,
          files: this.files,
          chunks: this.chunks,
          assets: this.assets,
        };
      },
    });
  }

  getSourceCode(chunk) {
    const { name, entryModule, modules } = chunk;
    const moduleStr = modules.map((module) => {
        return `'${module.id}': (module) => {
          ${module._source}
        }`
      })
      .join(',')

    console.log('moduleStr', moduleStr)
    return `
    (() => {
      var __webpack_modules__ = {
        ${moduleStr}
      };
      // The module cache
      var __webpack_module_cache__ = {};
  
      // The require function
      function __webpack_require__(moduleId) {
        // Check if module is in cache
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== undefined) {
          return cachedModule.exports;
        }
        // Create a new module (and put it into the cache)
        var module = (__webpack_module_cache__[moduleId] = {
          // no module.id needed
          // no module.loaded needed
          exports: {},
        });
  
        // Execute the module function
        __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
  
        // Return the exports of the module
        return module.exports;
      }
  
      var __webpack_exports__ = {};
      // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
      (() => {
        ${entryModule._source}
      })();
    })();
    `;
  }

}

module.exports = Compiler