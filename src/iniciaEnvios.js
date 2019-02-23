const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const opn = require('opn')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const configUtil = require('./lib/configUtil')
configUtil.testConfig()
const config = configUtil.getConfig()
const utils = require('./lib/utils')
const geraEmail = require('./lib/geraEmail')

async function enviaEmail() {
  try {
    // Confirma corpo do email
    const html = await geraEmail()
    const htmlPath = path.normalize(__dirname + '/../output/email.html')
    fs.writeFileSync(htmlPath, html, 'utf8')
    opn(htmlPath)

    const confirmaCorpo = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'corpo',
        message: 'Confirma o corpo do email visualizado?',
        default: false
      }
    ])
    if (!confirmaCorpo.corpo) {
      opn(config.path.conteudoPath)
      throw 'Encerrado. Email não Aprovado'
    }

    //Carrega Lote
    const confirmaLote = await inquirer.prompt([
      {
        name: 'lote',
        type: 'list',
        message: 'Escolha o lote',
        choices: ['Email unico', ...fs.readdirSync(config.path.lotesPath)]
      }
    ])

    var db
    if (confirmaLote.lote === 'Email unico') {
      db = await utils.dbUnico()
    } else {
      const adapter = new FileSync(
        path.join(config.path.lotesPath, confirmaLote.lote)
      )
      db = low(adapter)
    }

    const qtdeTotal = db
      .get('lote')
      .size()
      .value()
    const qtdeEnviado = db
      .get('lote')
      .filter({
        enviado: true
      })
      .size()
      .value()
    const enviar = db
      .get('lote')
      .filter({
        enviado: false
      })
      .value()
    const qtdeEnviar = enviar.length

    var confirmacao = `
    Lista de emails a enviar
    ------------------------
    
    `
    enviar.forEach(item => {
      confirmacao += '\n' + item.email
    })

    confirmacao += `

    ------------------------------------------
    Lote escolhido: ${confirmaLote.lote}
    Quantidade de emails no lote: ${qtdeTotal}
    Quantidade de emails no lote ja enviado: ${qtdeEnviado}
    Quantidade de emails no lote a enviar: ${qtdeEnviar}`

    console.log(confirmacao)
    const confirmaEnvio = await inquirer.prompt([
      {
        name: 'envio',
        type: 'confirm',
        default: false,
        message: 'Confirma o envio dos E-mails'
      },
      {
        name: 'intervalo',
        type: 'input',
        message: 'Tempo entre cada envio em minutos:',
        default: 10,
        validate: v => !isNaN(v)
      }
    ])
    if (!confirmaEnvio.envio) throw 'Envio cancelado pelo usuário'
    //Envio dos e-mails
    const date = new Date()

    for (var item of enviar) {
      await utils.enviaEmail(
        item.email,
        html,
        `Imóveis Disponíveis - ${date.getDate()}/${date.getMonth() +
          1}/${date.getFullYear()}`
      )
      console.log(`Email para ${item.email} enviado com sucesso`)
      db.get('lote')
        .find({
          email: item.email
        })
        .assign({
          enviado: true
        })
        .write()
      await utils.espera(Number(confirmaEnvio.intervalo) * 60)
      console.log('\n')
    }
  } catch (error) {
    console.log(error)
    console.log('Saindo em 5 segundos')
    setTimeout(() => {}, 5000)
  }
}

enviaEmail()