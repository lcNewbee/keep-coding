function loader1(sourceCode) {
  console.log('join loader 1')
  return sourceCode + '\n const loader1 = "https://github.com/loader1"'
}

module.exports = loader1