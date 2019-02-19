const fs = require('fs')
const path = require('path')
const shell = require('shelljs')
const yaml = require('js-yaml')
const handlebars = require('handlebars')
const _ = require('lodash')
const inquirer = require('inquirer')

const utils = require('./utils')

shell.config.silent = true

async function geraEmail() {
  try {
    // Carrega config.yml
    const config = await utils.loadConfig

    // Gera context do hbs
    const texto = yaml.safeLoad(
      shell.cat(path.join(config.conteudoPath, 'texto.yml'))
    )

    const arquivo = await inquirer.prompt([
      {
        name: 'escolha',
        type: 'list',
        message: 'Escolha a lista',
        choices: fs
          .readdirSync(config.conteudoPath)
          .filter(item => item.startsWith('imoveis'))
      }
    ])
    const lista = yaml.safeLoad(
      fs.readFileSync(path.join(config.conteudoPath, arquivo.escolha), 'utf8')
    )

    const imoveis = _.chain(lista)
      .drop()
      .groupBy(item => item.Tipo)
      .value()

    const context = {
      imoveis,
      texto
    }

    //Gera html
    const template = fs.readFileSync(path.join(__dirname, 'lista.hbs'), 'utf8')
    const output = handlebars.compile(template)(context)
    const outputPath = path.join(shell.pwd().toString(), 'output', 'email.html')

    shell.mkdir('output')
    shell.ShellString(output).to(outputPath)

    // Abre thunderbird
    const subject = 'Imóveis Disponíveis'
    shell.exec(
      `thunderbird --compose "to={{email}},message=${outputPath},subject=${subject}"`
    )
  } catch (error) {
    console.log(error)
  }
}

geraEmail()
