const test = require('tape')
const levelup = require('levelup')
const Distribase = require('./')

test('should be able to put things in the database', (t) => {
  t.plan(1)

  const db = levelup('', { db: (location) => new Distribase(location) })

  db.put('foo', 'bar', (err) => {
    t.ifError(err, 'No error putting things in')
    t.end()
  })
})

test('should be able to get things from the database', (t) => {
  t.plan(3)

  const db = levelup('', { db: (location) => new Distribase(location) })

  db.put('foo', 'bar', (err) => {
    t.ifError(err, 'No error putting things in')

    db.get('foo', (err, value) => {
      t.ifError(err, 'No error getting things out')
      t.equal(value.toString(), 'bar', 'Value was correct')
      t.end()
    })
  })
})

test('should respond appropriately when value is not found', (t) => {
  t.plan(1)

  const db = levelup('', { db: (location) => new Distribase(location) })

  db.get('NOTFOUND' + Date.now(), (err) => {
    t.ok(err.notFound, 'Value was not found')
    t.end()
  })
})

test('should be able to delete things from the db', (t) => {
  t.plan(3)

  const db = levelup('', { db: (location) => new Distribase(location) })

  db.put('foo', 'bar', (err) => {
    t.ifError(err, 'No error putting things in')

    db.del('foo', (err) => {
      t.ifError(err, 'No error deleting things')

      db.get('foo', (err) => {
        t.ok(err.notFound, 'Value was not found')
        t.end()
      })
    })
  })
})

test('should be able to store JSON in the database', (t) => {
  t.plan(3)

  const db = levelup('', {
    db: (location) => new Distribase(location),
    valueEncoding: 'json'
  })

  const input = { foo: 'bar' }

  db.put('foo', input, (err) => {
    t.ifError(err, 'No error putting things in')

    db.get('foo', (err, value) => {
      t.ifError(err, 'No error getting things out')
      t.equal(value.foo, 'bar', 'Value was correct')
      t.end()
    })
  })
})
