const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const yaml = require('js-yaml')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync.js')

class GeraLote {
  constructor(listaEmailPath, lotesPath) {
    this.lista = _(fs.readFileSync(listaEmailPath))
      .split('\n')
      .drop()
      .compact()
      .value()

    const filePrefix = path
      .basename(listaEmailPath)
      .match(/(.+?)(\.[^.]*$|$)/)[1]
    const hoje = new Date()
    const loteFileName = `${filePrefix}_${hoje.getDate()}-${hoje.getMonth() +
      1}-${hoje.getFullYear()}.csv`
    this.lotePath = path.join(lotesPath, loteFileName)
  }

  uniq() {
    return _(this.lista)
      .uniq()
      .map(email => ({
        email,
        enviado: false
      }))
      .value()
  }

  repetido() {
    return _(this.lista)
      .countBy()
      .pickBy(v => v > 1)
      .mapValues(v => v - 1)
      .thru(obj => yaml.safeDump(obj))
      .value()
  }

  save() {
    const adapter = new FileSync(this.lotePath)
    const db = low(adapter)
    db.set('lote', this.uniq())
      .set('log', [])
      .write()
  }

  static consulta(lotePath) {
    const adapter = new FileSync(lotePath)
    const db = low(adapter)
    const grouped = db.get('lote').groupBy('enviado')
    const enviados = grouped
      .get('true')
      .map(item => item.email)
      .value()
    const enviar = grouped
      .get('false')
      .map(item => item.email)
      .value()

    /* eslint-disable*/
    const loteInfo = `
      Email enviados
      --------------
      ${enviados.join('\n')}
  
      Email a enviar
      --------------
      ${enviar.join('\n')}
  
      =============
      Total enviado: ${enviados.length}
      Total a enviar: ${enviar.length}
      Total geral: ${db
        .get('lote')
        .size()
        .value()} 
      `
    /* eslint-enable*/
    return loteInfo
  }

  static getLog(lotePath) {
    const adapter = new FileSync(lotePath)
    const db = low(adapter)
    const log =  yaml.safeDump(db.get('log').value())
    return '\n\nLog\n---\n\n' + log
  }
}

module.exports = GeraLote
