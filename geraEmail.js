const fs = require('fs')
const path = require('path')

const shell = require('shelljs')
const yaml = require('js-yaml')
const handlebars = require('handlebars')
const _ = require('lodash')
const inquirer = require('inquirer')

shell.config.silent = true

async function geraEmail() {
  try {
    const config = yaml.safeLoad(
      fs.readFileSync(path.join(__dirname, 'config.yml'), 'utf8')
    )

    // Gera context do hbs
    const texto = yaml.safeLoad(
      fs.readFileSync(path.join(config.conteudoPath, 'texto.yml'), 'utf8')
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
    const outputPath = path.join(__dirname, 'output', 'email.html')
    fs.writeFileSync(outputPath, output, 'utf8')

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
