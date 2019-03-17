const path = require('path')
const fs = require('fs')
const {prompt} = require('inquirer')
const opn = require('opn')

const configUtil = require('./lib/configUtil')
const { consulta, getLog } = require('./lib/GeraLote')
const geraLote = require('./prompt/geraLote')
const geraEmail = require('./prompt/geraEmail')

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
    const opcao = await prompt([
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
    if (opcao.opcao === choices[4]) await geraEmail()
    if (opcao.opcao === choices[5]) await geraLote()

    if (opcao.opcao === choices[2]) {
      const choicesLotes = fs.readdirSync(config.path.lotesPath)
      const lote = await prompt([
        {
          name: 'lotes',
          type: 'list',
          message: 'Escolha o lote',
          choices: choicesLotes
        }
      ])
      const arquivoLote = path.join(config.path.lotesPath, lote.lotes)
      console.log(consulta(arquivoLote))
      const verLog = await prompt([
        {
          name: 'log',
          message: 'Deseja ver o log?',
          type: 'confirm',
          default: false
        }
      ])
      if (verLog.log) console.log(getLog(arquivoLote))
    }
  } catch (error) {
    console.log(error)
  }
}

adm()
