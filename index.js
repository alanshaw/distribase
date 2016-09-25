const { AbstractLevelDOWN } = require('abstract-leveldown')
const { inherits } = require('util')
const IpfsApi = require('ipfs-api')
const Boom = require('boom')
const concat = require('concat-stream')
const noop = () => 0

function Distribase (location) { AbstractLevelDOWN.call(this, location) }
inherits(Distribase, AbstractLevelDOWN)

Distribase.prototype._open = function (opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  this.ipfs = new IpfsApi((opts || {}).ipfs)
  process.nextTick(cb || noop)
}

Distribase.prototype._close = function (cb) {
  delete this.ipfs
  process.nextTick(cb || noop)
}

Distribase.prototype._get = function (key, opts, cb) {
  if (!key) return process.nextTick(() => cb(new Error('NotFound')))

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = opts || {}
  const path = `${this.location}/${key}`

  this.ipfs.files.read(path, opts, (err, response) => {
    if (err && err.message === 'file does not exist') {
      return cb(new Error('NotFound'))
    }

    if (err) return cb(err)

    if (response.statusCode !== 200) {
      return cb(Boom.create(response.statusCode, response.statusMessage, { response }))
    }

    response
      .on('error', cb)
      .pipe(concat((contents) => cb(null, contents)))
  })
}

Distribase.prototype._put = function (key, value, opts, cb) {
  if (!key) return process.nextTick(() => cb(new Error('Key is required')))

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = Object.assign({ create: true, truncate: true }, opts)
  const path = `${this.location}/${key}`

  if (Object.prototype.toString.call(value) === '[object String]') {
    value = new Buffer(value)
  }

  this.ipfs.files.write(path, value, opts, cb)
}

Distribase.prototype._del = function (key, opts, cb) {
  if (!key) return process.nextTick(() => cb(new Error('NotFound')))

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = Object.assign({ recursive: true }, opts)
  const path = `${this.location}/${key}`

  this.ipfs.files.rm(path, opts, cb)
}

module.exports = Distribase
