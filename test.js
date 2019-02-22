const _ = require('lodash')
const opn = require('opn')

opn('/home/eduardo/projects/loteEmail')

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

function join(local, foreign, localKey, foreignKey, as = 'foreign') {
  return _.map(local, itemLocal =>
    _.assign(
      itemLocal,
      _.fromPairs([
        'as',
        _.filter(
          foreign,
          foreignItem => itemLocal[localKey] === foreignItem[foreignKey]
        )
      ])
    )
  )
}

const result = join(a, b, 'userId', 'userId', 'b')
console.log(JSON.stringify(result, undefined, 2))
