const fs = require('fs')
const path = require('path')
const ProgressBar = require('progress')
const nodemailer = require('nodemailer')
const inquirer = require('inquirer')
const htmlToText = require('html-to-text')
const promisify = require('util').promisify
const xlsx = require('xlsx-to-json')


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

async function chooseFile(folder, message, filter) {
  var choices = fs.readdirSync(folder)
  if (filter) choices = choices.filter(filter)
  const prompt = await inquirer.prompt([
    { type: 'list', name: 'files', message, choices }
  ])
  return path.join(folder, prompt.files)
}

const xlsxPromise = promisify(xlsx)

module.exports = {
  espera,
  enviaEmail,
  chooseFile,
  xlsxPromise
}
