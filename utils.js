const fs = require('fs')
const path = require('path')

const shell = require('shelljs')
const yaml = require('js-yaml')
const ProgressBar = require('progress')
const nodemailer = require('nodemailer')
const inquirer = require('inquirer')
const low = require('lowdb')
const Memory = require('lowdb/adapters/Memory')

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
    resolve(yaml.safeLoad(config.toString()))
  }
})

const tempo = valorSegundos => {
  const minutos = Math.floor(valorSegundos / 60)
  const segundos = Math.round(valorSegundos % 60)
  return `Falta ${minutos} minutos, e ${segundos} segundos`
}

const espera = segundos => {
  return new Promise(resolve => {
    const bar = new ProgressBar(':bar Proximo: :falta', {
      total: Number(segundos)
    })

    bar.tick({
      falta: tempo(segundos - bar.curr)
    })
    const timer = setInterval(() => {
      bar.tick({
        falta: tempo(segundos - bar.curr)
      })
      if (bar.complete) {
        clearInterval(timer)
        resolve()
      }
    }, 1000)
  })
}

async function enviaEmail(to, html, subject) {
  try {
    const config = await loadConfig
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
