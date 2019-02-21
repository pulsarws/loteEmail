const low = require('lowdb')
const mem = require('lowdb/adapters/Memory')

const adapter = new mem()
const db = low(adapter)
db.defaults({ lotes: [] }).write()
db.set('lotes', { a: 1 }).write()
console.log(db.value())
