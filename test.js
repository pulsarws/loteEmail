const fs = require('fs')
const path = require('path')

const dirPath = path.join(__dirname, 'teste')

if (fs.existsSync(dirPath)) {
  fs.rm
  fs.rmdirSync(dirPath)
}
fs.mkdirSync(dirPath)
fs.writeFileSync(path.join(dirPath, 'opa.txt'), 'numero 1', 'utf8')
