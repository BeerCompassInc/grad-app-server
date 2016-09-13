var feathers = require('feathers/client')
var hooks = require('feathers-hooks')
var auth = require('feathers-authentication/client')
var rest = require('feathers-rest/client')
var request = require('supertest')
var superagent = require('superagent')
var test = require('tape')
var pull = require('pull-stream')
var async = require('pull-async')
var promise = require('pull-promise')
var {asyncMap, map, drain} = require('pull-stream')

var App = require('../../../src/app')
var knex = require('../../../db/knex')()
var generateUser = require('../../../generateUser')

test('can get all the grads', function (t) {
  var app = App({knex})
  request(app)
    .get('/grads')
    .expect(200)
    .end(function (err, res) {
      t.error(err)
      t.end()
    })
})

test('can not update a grad when not logged in', function (t) {
  var app = App({knex})
  request(app)
    .put('/grads')
    .end(function (err, res) {
      t.equal(res.status, 401, 'got 401, denied')
      t.end()
    })
})

test('can authenticate as admin and create a grad', function (t) {
  var app = App({knex})
  const email = 'admin@admin.com'
  const password = 'password123'
  const newAdmin = {email, password, roles: 'admin'}
  var port = 3031
  var host = `http://localhost:${port}`
  var server = app.listen(port)

  var client = feathers()
    .configure(rest(host).superagent(superagent))
    .configure(hooks())
    .configure(auth())

  pull(
    async((cb) => {
      generateUser(newAdmin, {knex}, cb)
    }),
    promise.through((user) => {
      t.ok(true, 'generate new user')
      return client.authenticate({type: 'local', email, password})
    }),
    promise.through(() => {
      t.ok(true, 'authenitcate as new user')
      var grads = client.service('grads')
      return grads.create({	name: 'coool'	})
    }),
    drain(function (grad) {
      t.equal(grad.name, 'coool')
      t.end()
      server.close()
    })
  )
})

test('grads cannot create more grads', function (t) {
  var app = App({knex})
  const email = 'grad@grad.com'
  const password = 'password123'
  generateUser({
    email,
    password,
    roles: 'grad'
  }, {knex},
    function (err, res) {
      t.error(err)

      var port = 3032
      var server = app.listen(port)
      var host = `http://localhost:${port}`
      var client = feathers()
        .configure(rest(host).superagent(superagent))
        .configure(hooks())
        .configure(auth())

      var grads = client.service('grads')

      client.authenticate({
        type: 'local',
        email,
      password})
        .then(function () {
          t.ok(true, 'authenticated ok')
          return grads.create({
            name: 'coool'
          })
        })
        .then(function (grad) {
          t.fail()
        })
        .catch(function (err) {
          t.ok(err)
          t.end()
          server.close()
        })
    })
})

test.onFinish(function () {
  knex.select().table('users').del()
    .then(function () {
      console.log('deleted all the things')
      return knex.destroy()
    })
    .then(function () {
      console.log('closed knex')
    })
})