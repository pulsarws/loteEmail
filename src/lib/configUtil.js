const path = require('path')
const shell = require('shelljs')
const yaml = require('js-yaml')
const opn = require('opn')

const configPath = path.normalize(__dirname + '/../config/config.yml')
const configExemploPath = path.normalize(
  __dirname + '/../config/configExemplo.yml'
)

function testConfig() {
  if (!shell.test('-f', configPath)) return newConfig()

  const config = yaml.safeLoad(shell.cat(configPath))
  if (!config.path) return newConfig()
  Object.keys(config.path).forEach(key => {
    const keyPath = config.path[key]
    if (!shell.test('-d', keyPath)) return newConfig()
  })
}

function newConfig() {
  if (!shell.test('-f', configPath)) shell.cat(configExemploPath).to(configPath)
  opn(configPath)
  throw new Error('Erro na configuração de PATH. Abrindo Arquivo')
}

function getConfig() {
  return yaml.safeLoad(shell.cat(configPath))
}

module.exports = { testConfig, getConfig }
