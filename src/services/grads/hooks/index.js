'use strict'

const hooks = require('feathers-hooks-common')
const auth = require('feathers-authentication').hooks

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: ['admin'],
      fieldName: 'roles',
      idField: 'id'
    })
  ],
  update: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: ['admin'],
      fieldName: 'roles',
      idField: 'id',
      ownerField: 'user_id',
      owner: true
    })
  ],
  patch: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: ['admin'],
      fieldName: 'roles',
      idField: 'id',
      ownerField: 'user_id',
      owner: true
    })
  ],
  remove: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: ['admin'],
      fieldName: 'roles',
      idField: 'id',
      ownerField: 'user_id',
      owner: true
    })
  ]
}

exports.after = {
  all: [],
  find: [
    hooks.iff(hooks.isProvider('external'), hooks.populate('user', {
      service: 'users',
      field: 'user_id'
    })),
    hooks.remove('password_hash')
  ],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
}
