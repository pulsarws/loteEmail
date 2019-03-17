const path = require('path')
const shell = require('shelljs')
const yaml = require('js-yaml')
const opn = require('opn')
const expect = require('chai').expect


const configPath = path.normalize(__dirname + '/../config/config.yml')
const configExemploPath = path.normalize(
  __dirname + '/../config/configExemplo.yml'
)

describe('Configuração de pastas', async function() {
  it('config.yml tem que existir na pasta config', function() {
    expect(shell.test('-f', configPath)).equals(true, 'config.yml não existe')
    
  })

  
})

