const fs = require('fs-extra')
const _ = require('lodash')
const inquirer = require('inquirer')

//item.match(/(.+?)(\.[^.]*$|$)/)[1]
const listaArquivosDados = fs.readdirSync('./contatos', 'utf8')

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
      fs.readFileSync('./contatos/' + escolha.escolha, 'utf8')
    )
      .split('\n')
      .drop()
      .compact()
      .value()
    const chunkSize = Math.ceil(listaEmail.length / 20)
    const lotes = _.chunk(listaEmail, chunkSize)
    const dir = escolha.escolha.match(/(.+?)(\.[^.]*$|$)/)[1]

    //Gera arquivos
    var i = 1
    // if (fs.existsSync(`./lotes/${dir}`)) fs.rmdirSync(`./lotes/${dir}`)
    fs.removeSync(`./lotes/${dir}`)
    fs.mkdirSync(`./lotes/${dir}`)

    const lotesCsv = _.chain(lotes)
      .map(lote => ['email', ...lote])
      .map(lote => _.join(lote, '\n'))
      .map(lote => {
        const file = fs.promises.writeFile(`./lotes/${dir}/${dir}-${i}.csv`, lote)
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
