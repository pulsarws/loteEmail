const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')
const inquirer = require('inquirer')
const yaml = require('js-yaml')
const shell = require('shelljs')

var config = shell.cat('./config.yml')
if (config.code !== 0) {
  var erro = 'Erro: crie arquivo config.yml no seguinte formato:\n\n'
  erro += fs.readFileSync(path.join(__dirname, 'configExemplo.yml'), 'utf8')
  throw erro
}
config = yaml.safeLoad(config.toString())

const listaArquivosDados = fs.readdirSync(config.listasEmailPath, 'utf8')

async function geraLote() {
  try {
    // Escolha arquivo
    const escolha = await inquirer.prompt([
      {
        name: 'escolha',
        type: 'list',
        message: 'Escolha o arquivo',
        choices: listaArquivosDados
      }
    ])

    // Cria array de emails
    const listaEmail = _.chain(
      fs.readFileSync(
        path.join(config.listasEmailPath, escolha.escolha),
        'utf8'
      )
    )
      .split('\n')
      .drop()
      .compact()
      .value()
    const chunkSize = Math.ceil(listaEmail.length / 20)
    const lotes = _.chunk(listaEmail, chunkSize)
    const dir = escolha.escolha.match(/(.+?)(\.[^.]*$|$)/)[1]

    //Gera arquivos
    // if (fs.existsSync(`./lotes/${dir}`)) fs.rmdirSync(`./lotes/${dir}`)
    fs.removeSync(path.join(config.lotesPath, dir))
    fs.mkdirSync(path.join(config.lotesPath, dir))
    var i = 1
    const lotesCsv = _.chain(lotes)
      .map(lote => ['email', ...lote])
      .map(lote => _.join(lote, '\n'))
      .map(lote => {
        const file = fs.promises.writeFile(
          path.join(config.lotesPath, dir, `${dir}- ${i}.csv`),
          lote
        )
        i++
        return file
      })
      .value()

    await Promise.all(lotesCsv)
  } catch (error) {
    console.log(error)
  }
}

geraLote()
