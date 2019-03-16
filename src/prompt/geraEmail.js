const { chooseFile } = require('../lib/utils')
const GeraEmail = require('../lib/GeraEmail')
const configUtil = require('./configUtil')

const config = configUtil.getConfig()

async function geraEmail() {
  try {
    const arquivoLista = await chooseFile(
      config.path.conteudoPath,
      'escolha arquivo com o Texto Inicial: ',
      item => item.startsWith('imoveis')
    )
    const arquivoTexto = await chooseFile(
      config.path.conteudoPath,
      'escolha arquivo com o Texto Inicial: ',
      item => item.startsWith('texto')
    )

    const geraEmail = new GeraEmail({arquivoLista, arquivoTexto})
    const html = await geraEmail.getHtml()
    return html
  } catch (error) {
    console.log(error)
  }
}

module.exports = geraEmail
