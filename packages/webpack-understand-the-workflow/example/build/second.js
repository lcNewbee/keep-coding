
    (() => {
      var __webpack_modules__ = {
        './webpack/example/src/module.js': (module) => {
          const name = '19Qingfeng';
module.exports = {
  name
};
const loader1 = "https://github.com/loader1";
const loader2 = "https://github.com/loader2";
        }
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
        const depModule = __webpack__require__("./webpack/example/src/module.js");

console.log(depModule, 'dep');
console.log('This is entry 2 !');
const loader1 = "https://github.com/loader1";
const loader2 = "https://github.com/loader2";
      })();
    })();
    