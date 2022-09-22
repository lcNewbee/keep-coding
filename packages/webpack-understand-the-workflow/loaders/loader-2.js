function loader2(sourceCode) {
  console.log('join loader 2')
  return sourceCode + '\n const loader2 = "https://github.com/loader2"'
}

module.exports = loader2