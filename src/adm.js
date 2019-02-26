const path = require('path')
const fs = require('fs')
const inquirer = require('inquirer')
const opn = require('opn')
const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const yaml = require('js-yaml')

const configUtil = require('./lib/configUtil')

configUtil.testConfig()
const config = configUtil.getConfig()

async function adm() {
  try {
    const choices = [
      'Adiciona/Remove email da base de dados',
      'Altera lista de imoveis ou textos',
      'Verifica informacoes de lote de email',
      'Altera configuracoes',
      'Inicia envio de emails',
      'Gera novo Lote',
      'Sair'
    ]
    const opcao = await inquirer.prompt([
      {
        name: 'opcao',
        message: 'Escolha a opcao desejada',
        type: 'list',
        choices: choices
      }
    ])

    if (opcao.opcao === choices[0]) opn(config.path.listasEmailPath)
    if (opcao.opcao === choices[1]) opn(config.path.conteudoPath)
    if (opcao.opcao === choices[3])
      opn(path.join(__dirname, 'config', 'config.yml'))
    if (opcao.opcao === choices[4]) require('./iniciaEnvios')
    if (opcao.opcao === choices[5]) require('./geraLote')

    if (opcao.opcao === choices[2]) {
      const choicesLotes = fs.readdirSync(config.path.lotesPath)
      const lote = await inquirer.prompt([
        {
          name: 'lotes',
          type: 'list',
          message: 'Escolha o lote',
          choices: choicesLotes
        }
      ])
      const adapter = new FileSync(path.join(config.path.lotesPath, lote.lotes))
      const db = lowdb(adapter)
      const grouped = db.get('lote').groupBy('enviado')
      const enviados = grouped
        .get('true')
        .map(item => item.email)
        .value()
      const enviar = grouped
        .get('false')
        .map(item => item.email)
        .value()
      /* eslint-disable*/
      const loteInfo = `
      Email enviados
      --------------
      ${enviados.join('\n')}
  
      Email a enviar
      --------------
      ${enviar.join('\n')}
  
      =============
      Total enviado: ${enviados.length}
      Total a enviar: ${enviar.length}
      Total geral: ${db
        .get('lote')
        .size()
        .value()} 
      `
      /* eslint-enable*/
      console.log(loteInfo)
      const verLog = await inquirer.prompt([
        {
          name: 'log',
          message: 'Deseja ver o log?',
          type: 'confirm',
          default: false
        }
      ])
      var log = yaml.safeDump(db.get('log').value())

      if (verLog.log) console.log('\n\nLog\n---\n\n' + log)
    }
  } catch (error) {
    console.log(error)
  }
}

adm()
