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

const result1 = join3({
  local: a,
  foreign: b,
  localKey: 'userId',
  foreignKey: 'userId',
  as: 'foreign'
})
// console.log(yaml.safeDump(result1))

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

const repetido = (arr, key) =>
  _.chain(arr)
    .uniqBy(key)
    .xor(arr)
    .countBy(key)
    .thru(obj => yaml.safeDump(obj))
    .value()

const repetido2 = arr =>
  _.chain(arr)
    .countBy()
    .pickBy(v => v > 1)
    .thru(obj => yaml.safeDump(obj))
    .value()

const withRepeat2 = [1, 2, 3, 2, 4, 3, 3]
const result = repetido2(withRepeat2)
console.log(result)
