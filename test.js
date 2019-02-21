const _ = require('lodash')

var a = [
  { userId: 'p1', item: 1 },
  { userId: 'p2', item: 2 },
  { userId: 'p3', item: 4 }
]

var b = [
  { userId: 'p1', profile: 1 },
  { userId: 'p2', profile: 2 },
  { userId: 'p4', profile: 4 }
]

var u = _.map(a, function(obj) {
  // add the properties from second array matching the userID
  // to the object from first array and return the updated object
  return _.assign(obj, _.find(b, { userId: obj.userId }))
})

const join = (base, toJoin, key) => {
  return _.map(base, item => _.assign(item, _.find(toJoin, )))
}

console.log(u)
