const _ = require('lodash')
const yaml = require('js-yaml')
// const opn = require('opn')

// opn('/home/eduardo/projects/loteEmail')

var a = [
  { userId: 'p1', item: 1 },
  { userId: 'p2', item: 2 },
  { userId: 'p3', item: 4 }
]

var b = [
  { userId: 'p1', profile: 1 },
  { userId: 'p1', profile: 5 },
  { userId: 'p2', profile: 2 },
  { userId: 'p4', profile: 4 }
]

function join({ local, foreign, localKey, foreignKey, as = 'foreign' }) {
  return _.map(local, itemLocal =>
    _.assign(
      itemLocal,
      _.fromPairs([
        [
          as,
          _.filter(
            foreign,
            foreignItem =>
              _.at(itemLocal, localKey)[0] === _.at(foreignItem, foreignKey)[0]
          )
        ]
      ])
    )
  )
}

function join3({ local, foreign, localKey, foreignKey, as = 'foreign' }) {
  return _.map(local, itemLocal => {
    const lookup = _.filter(foreign, foreignItem => {
      return _.at(itemLocal, localKey)[0] === _.at(foreignItem, foreignKey)[0]
    })
    const foreignObj = _.fromPairs([[as, lookup]])
    return _.assign(itemLocal, foreignObj)
  })
}

const result = join3({
  local: a,
  foreign: b,
  localKey: 'userId',
  foreignKey: 'userId',
  as: 'foreign'
})

const withRepeat = [
  { a: 'oi' },
  { a: 'ola' },
  { a: 'oie' },
  { a: 'oi' },
  { a: 'oie' },
  { a: 'oi' },
  { a: 'oie' },
  { a: 'oi' },
  { a: 'ola' }
]

const repetido = (arr, key) => {
  return _.chain(arr)
    .groupBy(key)
    .map((item, keyGrouped) =>
      item.length > 1 ? _.fromPairs([[keyGrouped, item.length]]) : null
    )
    .compact()
    .thru(result => yaml.safeDump(result))
    .value()
}

const repetido2 = (arr, key) =>
  _.chain(arr)
    .uniqBy(key)
    .xor(arr)
    .countBy(key)
    .thru(result => yaml.safeDump(result))
    .value()

const result2 = repetido2(withRepeat, 'a')
console.log(result2)
console.log(yaml.safeLoad(result2))

var aa = [1,2,3]
aa.push(4,5)
console.log(aa)
var ab = new Date()
console.log(ab.toString())

