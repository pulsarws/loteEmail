const fs = require('fs')
const path = require('path')
const opn = require('opn')
const { prompt } = require('inquirer')

const { chooseFile } = require('../lib/utils')
const GeraEmail = require('../lib/GeraEmail')
const Envio = require('../lib/Envio')
const configUtil = require('./configUtil')

const config = configUtil.getConfig()

async function geraEmail() {
  try {
    //Geral Corpo do Email
    const arquivoLista = await chooseFile(
      config.path.conteudoPath,
      'escolha arquivo com o Texto Inicial: ',
      item => item.startsWith('imoveis')
    )
    const arquivoTexto = await chooseFile(
      config.path.conteudoPath,
      'escolha arquivo com o Texto Inicial: ',
      item => item.startsWith('texto')
    )

    const geraEmail = new GeraEmail({ arquivoLista, arquivoTexto })
    const html = await geraEmail.getHtml()
    const htmlPath = path.normalize(__dirname + '/../output/email.html')
    fs.writeFileSync(htmlPath, html, 'utf8')
    opn(htmlPath)

    const confirmaCorpo = await prompt([
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
    const promptLote = await prompt([
      {
        name: 'lote',
        type: 'list',
        message: 'Escolha o lote',
        choices: ['Email unico', ...fs.readdirSync(config.path.lotesPath)]
      }
    ])
    var unico = promptLote.lote === 'Email unico' ? true : false
    if (!unico) {
      unico = await prompt([
        {
          type: 'input',
          message: 'Digite o email para enviar',
          name: 'unico'
        }
      ])
      unico = unico.input
    }
    
    //Confirma envio dos email emails
    const envio = new Envio({
      unico,
      nomeLote: promptLote.lote,
      pathLote: config.path.lotesPath,
      html
    })
    console.log(envio.textoConfirmacao())
    const confirmaEnvio = await prompt([
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

    //Envia emails
    await envio.enviar(Number(confirmaEnvio.intervalo) * 60)
    console.log('\n')
    return html
  } catch (error) {
    console.log(error)
  }
}

module.exports = geraEmail
