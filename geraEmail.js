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
    const outputPath = path.join(__dirname, 'output', 'email.html')

    // Gera context do hbs
    const texto = yaml.safeLoad(
      fs.readFileSync(path.join(__dirname, '/dados/texto.yml'), 'utf8')
    )

    const arquivo = await inquirer.prompt([
      {
        name: 'escolha',
        type: 'list',
        message: 'Escolha a lista',
        choices: fs.readdirSync(path.join(__dirname, 'dados')).filter(item => item.startsWith('imoveis'))
      }
    ])
    const lista = yaml.safeLoad(
      fs.readFileSync(path.join(__dirname, 'dados', arquivo.escolha), 'utf8')
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
    const template = fs.readFileSync(path.join(__dirname, '/lista.hbs'), 'utf8')
    const output = handlebars.compile(template)(context)
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
