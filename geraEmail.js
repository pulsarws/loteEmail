const fs = require('fs')
const promisify = require('util').promisify
const path = require('path')
const shell = require('shelljs')
const handlebars = require('handlebars')
const _ = require('lodash')
const inquirer = require('inquirer')
const xlsx = require('xlsx-to-json')

const utils = require('./utils')

const xlsxPromise = promisify(xlsx)
shell.config.silent = true

async function geraEmail() {
  try {
    // Carrega config.yml
    const config = utils.loadConfig()

    // Gera context do hbs  
    const arquivo = await inquirer.prompt([
      {
        name: 'lista',
        type: 'list',
        message: 'Escolha a lista',
        choices: fs
          .readdirSync(config.path.conteudoPath)
          .filter(item => item.startsWith('imoveis'))
      },
      {
        name: 'texto',
        type: 'list',
        message: 'Escolha arquivo de texto',
        choices: fs
          .readdirSync(config.path.conteudoPath)
          .filter(item => item.startsWith('texto'))
      }
    ])

    var texto = await xlsxPromise({
      input: path.join(config.path.conteudoPath, arquivo.texto),
      output: null
    })
    texto = texto[0]

    var lista = await xlsxPromise({
      input: path.join(config.path.conteudoPath, arquivo.lista),
      output: null
    })
    lista = lista.filter(item => item.Nome !== '')

    const imoveis = _.chain(lista)
      .groupBy(item => item.Tipo)
      .value()

    const context = {
      imoveis,
      texto
    }

    //Gera html
    const template = fs.readFileSync(path.join(__dirname, 'lista.hbs'), 'utf8')
    const output = handlebars.compile(template)(context)

    return output
  } catch (error) {
    console.log(error)
  }
}

module.exports = geraEmail