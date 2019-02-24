const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const inquirer = require('inquirer')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync.js')

const configUtil = require('./lib/configUtil')
configUtil.testConfig()
const config = configUtil.getConfig()

async function geraLote() {
  try {
    // Escolha arquivo
    const listaArquivosDados = fs.readdirSync(config.path.listasEmailPath, 'utf8')
    const escolha = await inquirer.prompt([
      {
        name: 'escolha',
        type: 'list',
        message: 'Escolha o arquivo',
        choices: listaArquivosDados
      }
    ])

    // Cria array de emails
    const listaEmail = _.chain(
      fs.readFileSync(
        path.join(config.path.listasEmailPath, escolha.escolha),
        'utf8'
      )
    )
      .split('\n')
      .drop()
      .compact()
      .map(email => ({
        email,
        enviado: false
      }))
      .value()

    //Gera lowdb
    const fileName = escolha.escolha.match(/(.+?)(\.[^.]*$|$)/)[1]
    var hoje = new Date()
    hoje = `${hoje.getDate()}-${hoje.getMonth() + 1}-${hoje.getFullYear()}`
    const adapter = new FileSync(
      path.join(config.path.lotesPath, `${fileName}_${hoje}.json`)
    )
    const db = low(adapter)

    db.set('lote', listaEmail).write()
    db.set('log', []).write()

    console.log('Salvo com Sucesso. Saindo em 5 segundos')
    setTimeout(() => {}, 5000)
  } catch (error) {
    console.log(error)
    console.log('Saindo em 5 segundos')
    setTimeout(() => {}, 5000)
  }
}

geraLote()