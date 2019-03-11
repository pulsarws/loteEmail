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
}

module.exports = GeraLote
