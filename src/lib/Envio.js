const path = require('path')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const Memory = require('lowdb/adapters/Memory')

const { enviaEmail, espera } = require('../lib/utils')

class Envio {
  constructor({ unico, nomeLote, pathLote, html }) {
    this.html = html
    this.unico = unico
    if (!unico) {
      this.nomeLote = nomeLote
      this.arquivoLote = path.join(pathLote, nomeLote)
      const adapter = new FileSync(this.arquivoLote)
      this.db = low(adapter)
    } else {
      const adapter = new Memory()
      this.db = low(adapter)
      this.db.defaults({ lote: [] })
        .set('lote', [{ email: unico, enviado: false }])
        .write()
    }
    this.qtdeTotal = this.db
      .get('lote')
      .size()
      .value()
    this.qtdeEnviado = this.db
      .get('lote')
      .filter({
        enviado: true
      })
      .size()
      .value()
    this.enviar = this.db
      .get('lote')
      .filter({
        enviado: false
      })
      .value()
    this.qtdeEnviar = this.enviar.length
  }

  textoConfirmacao() {
    var text = `
    Lista de emails a enviar
    ------------------------
    
    `
    this.enviar.forEach(item => {
      text += '\n' + item.email
    })
    text += `

    ------------------------------------------
    Lote escolhido: ${this.nomeLote}
    Quantidade de emails no lote: ${this.qtdeTotal}
    Quantidade de emails no lote ja enviado: ${this.qtdeEnviado}
    Quantidade de emails no lote a enviar: ${this.qtdeEnviar}`
    return text
  }

  static convertDate(date) {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  async enviar(intervalo) {
    for (var item of this.enviar) {
      const date = new Date()
      var envioResult = await enviaEmail(
        item.email,
        this.html,
        `Imóveis Disponíveis - ${this.convertDate(date)}`
      )

      console.log(`Email para ${item.email} enviado com sucesso`)
      const { db } = this
      db.get('log').push({ envioResult, timestamp: date })
      db.get('lote')
        .find({
          email: item.email
        })
        .assign({
          enviado: true
        })
        .write()

      await espera(Number(intervalo) * 60)
      console.log('\n')
    }
  }
}

module.exports = Envio
