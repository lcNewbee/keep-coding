
// 代码来源：https://mp.weixin.qq.com/s/DXjxZwhEJM8Hm8FtESxDEA

const webpack = require('./webpack.js')
const config = require('../example/webpack.config.js')

console.log('webpack', webpack)

const compiler = webpack(config)

compiler.run((err, stat) => {
  if (err) {
    console.log('err', err)
  }
})