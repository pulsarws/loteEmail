const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const inquirer = require('inquirer')
const shell = require('shelljs')

const utils = require('./utils')

async function geraLote() {
  try {
    // Carrega config.yml
    const config = await utils.loadConfig


    // Escolha arquivo
    const listaArquivosDados = fs.readdirSync(config.listasEmailPath, 'utf8')
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

    shell.rm('-rf', path.join(config.lotesPath, dir))
    shell.mkdir(path.join(config.lotesPath, dir))
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
    console.log('Salvo com Sucesso. Saindo em 5 segundos')
    setTimeout(() =>{
    }, 5000)
  } catch (error) {
    console.log(error)
    console.log('Saindo em 5 segundos')
    setTimeout(() => {
    }, 5000)
  }
}

geraLote()
