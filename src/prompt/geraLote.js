const GeraLote = require('../lib/GeraLote.js')
const { chooseFile } = require('../lib/utils')
const configUtil = require('../lib/configUtil')

configUtil.testConfig()
const config = configUtil.getConfig()

async function geraLote() {
  try {
    const listaEmailPath = await chooseFile(
      config.path.listasEmailPath,
      'Escolha o arquivo com a Lista de Emails'
    )
    const lote = new GeraLote(listaEmailPath, config.path.lotesPath)

    console.log(
      'Os seguintes e-mails estão repetidos\nVeja na tabela abaixo quantos registros voce deve apagar da Lista de Emails. Apague-os manualmente.\n' +
        lote.repetido() +
        '\nForam descartados emails repetidos, então pode usar o lote gerado.'
    )

    lote.save()
    console.log('Salvo com Sucesso. Saindo em 5 segundos')
    setTimeout(() => {}, 5000)
  } catch (error) {
    console.log(error)
    console.log('Saindo em 5 segundos')
    setTimeout(() => {}, 5000)
  }
}

module.exports = geraLote
