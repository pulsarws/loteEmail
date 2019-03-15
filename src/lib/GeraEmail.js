const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const handlebars = require('handlebars')

const { xlsxPromise } = require('./utils')

class GeraEmail {
  constructor({ arquivoLista, arquivoTexto }) {
    this.arquivoLista = arquivoLista
    this.arquivoTexto = arquivoTexto
  }

  async getContext() {
    var texto = xlsxPromise({ input: this.arquivoTexto, output: null })
    var imoveis = xlsxPromise({ input: this.arquivoLista, output: null })

    texto = await texto
    texto = texto[0]

    imoveis = await imoveis
    imoveis = _.chain(imoveis)
      .filter(item => item.Nome !== '')
      .groupBy(item => item.Tipo)
      .value()
    return { imoveis, texto }
  }

  async getHtml() {
    const template = fs.readFileSync(path.normalize(__dirname + '/../template/lista.hbs'), 'utf8')
    const context = await this.getContext()
    const output = handlebars.compile(template)(context)
    return output
  }
}

module.exports = GeraEmail
