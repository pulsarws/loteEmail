const fs = require('fs')
const path = require('path')
const shell = require('shelljs')
const yaml = require('js-yaml')

const loadConfig = new Promise((resolve, reject) => {
  const config = shell.cat('./config.yml')
  if (config.code !== 0) {
    var erro = 'Erro: crie arquivo config.yml no seguinte formato:\n\n'
    erro += fs.readFileSync(path.join(__dirname, 'configExemplo.yml'), 'utf8')
    console.log(erro)
    console.log('Saindo em 10 segundos...')
    setTimeout(() => {
      reject('Erro: Saindo...')
    }, 10000)
  } else {
    resolve (yaml.safeLoad(config.toString()))
  }
})

module.exports = { loadConfig }
