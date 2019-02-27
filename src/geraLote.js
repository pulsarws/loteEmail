const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const inquirer = require('inquirer')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync.js')
const yaml = require('js-yaml')

const configUtil = require('./lib/configUtil')
configUtil.testConfig()
const config = configUtil.getConfig()

async function geraLote() {
  try {
    // Escolha arquivo
    const listaArquivosDados = fs.readdirSync(
      config.path.listasEmailPath,
      'utf8'
    )
    const escolha = await inquirer.prompt([
      {
        name: 'escolha',
        type: 'list',
        message: 'Escolha o arquivo',
        choices: listaArquivosDados
      }
    ])

    // Cria array de emails
    var listaEmail = _.chain(
      fs.readFileSync(
        path.join(config.path.listasEmailPath, escolha.escolha),
        'utf8'
      )
    )
      .split('\n')
      .drop()
      .compact()

    const repetido = listaEmail
      .countBy()
      .pickBy(v => v > 1)
      .mapValues(v => v - 1)
      .thru(obj => yaml.safeDump(obj))
      .value()

    listaEmail = listaEmail
      .uniq()
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

    console.log(
      'Os seguintes e-mails estão repetidos\nVeja na tabela abaixo quantos registros voce deve apagar da Lista de Emails:\n' +
        repetido +
        '\nForam descartados emails repetidos, então pode continuar com a geração do Lote.'
    )
    console.log('Salvo com Sucesso. Saindo em 5 segundos')
    setTimeout(() => {}, 5000)
  } catch (error) {
    console.log(error)
    console.log('Saindo em 5 segundos')
    setTimeout(() => {}, 5000)
  }
}

geraLote()
