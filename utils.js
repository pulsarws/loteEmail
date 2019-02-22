const fs = require('fs')
const path = require('path')

const shell = require('shelljs')
const yaml = require('js-yaml')
const ProgressBar = require('progress')
const nodemailer = require('nodemailer')
const inquirer = require('inquirer')
const low = require('lowdb')
const Memory = require('lowdb/adapters/Memory')
const opn = require('opn')

function loadConfig() {
  const config = shell.cat('./config.yml')
  if (config.code !== 0) {
    const erro = fs.readFileSync(
      path.join(__dirname, 'configExemplo.yml'),
      'utf8'
    )
    fs.writeFileSync(path.join(__dirname, 'config.yml'), erro, 'utf8')
    opn(path.join(__dirname, 'config.yml'))
    throw new Error('Arquivo de configuracao inexistente. Saindo...')
  } else {
    const configObj = yaml.safeLoad(config.toString())
    if (!configObj.path) throw new Error('Não há propriedade path')
    Object.keys(configObj.path).forEach(key => {
      const dir = shell.ls(configObj.path[key])
      if (dir.code !== 0) {
        console.log('Confira as configurações')
        opn(path.join(__dirname, 'config.yml'))
        throw new Error(`Pasta inexiste na opção ${configObj.path[key]}`)
      }
    })
    return configObj
  }
}

const tempo = valorSegundos => {
  const minutos = Math.floor(valorSegundos / 60)
  const segundos = Math.round(valorSegundos % 60)
  return `Falta ${minutos} minutos, e ${segundos} segundos`
}

const espera = segundos => {
  return new Promise(resolve => {
    const bar = new ProgressBar('Proximo: :falta', {
      total: segundos, width: 10
    })

    var falta = tempo(segundos - bar.curr)
    bar.tick({ falta })
    const timer = setInterval(() => {
      falta = tempo(segundos - bar.curr)
      bar.tick({ falta })
      if (bar.complete) {
        clearInterval(timer)
        resolve()
      }
    }, 1000)
  })
}

async function enviaEmail(to, html, subject) {
  try {
    const config = loadConfig()
    const transport = config.transport
    const transporter = nodemailer.createTransport(transport)
    const mailOptions = {
      from: transport.auth.user,
      to,
      subject,
      html
    }
    const envio = await transporter.sendMail(mailOptions)
    return envio
  } catch (error) {
    throw new Error(error)
  }
}

async function dbUnico() {
  const emailUnico = await inquirer.prompt([
    {
      type: 'input',
      message: 'Digite o email para enviar',
      name: 'unico'
    }
  ])
  const adapter = new Memory()
  const db = low(adapter)
  db.defaults({ lote: [] })
    .set('lote', [{ email: emailUnico.unico, enviado: false }])
    .write()

  return db
}

module.exports = {
  loadConfig,
  espera,
  enviaEmail,
  dbUnico
}
