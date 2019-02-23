const ProgressBar = require('progress')
const nodemailer = require('nodemailer')
const inquirer = require('inquirer')
const low = require('lowdb')
const Memory = require('lowdb/adapters/Memory')
const htmlToText = require('html-to-text')

const configUtil = require('./configUtil')

const tempo = valorSegundos => {
  const minutos = Math.floor(valorSegundos / 60)
  const segundos = Math.round(valorSegundos % 60)
  return `Falta ${minutos} minutos, e ${segundos} segundos`
}

const espera = segundos => {
  return new Promise(resolve => {
    const bar = new ProgressBar('Proximo: :falta', {
      total: segundos,
      width: 10
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
    const config = configUtil.getConfig()
    const text = htmlToText.fromString(html, { wordwrap: 130 })
    const transport = config.transport
    const transporter = nodemailer.createTransport(transport)
    const mailOptions = {
      from: { name: transport.auth.name, address: transport.auth.user },
      to,
      subject,
      html,
      text
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
  espera,
  enviaEmail,
  dbUnico
}
