var npm = require('./npm')
var _ = require('lodash')
var Promise = require('bluebird')
var utils = require('./utils')
var exec = Promise.promisify(require('child_process').exec)

var config = require('../fact/npm-dichotomy.json');

utils.DEBUG = config.debug

var client = npm()

var modules = _.keys(config.modules)
var versions = _.map(config.modules, function (criteria, module) {
  return client.call('view', module, 'versions')
    .then(utils.filter(utils.checkVersions(criteria)))
    .then(utils.debug(module))
})

var combinations = Promise.all(versions)
  .spread(utils.cartesian).call('toArray')
  .then(utils.map(utils.map(namedVersion)))
  .then(utils.debug('Total combinations'))

var setup = config.setup ? exec(config.setup) : Promise.resolve('')

Promise.all([combinations, setup])
  .spread(utils.series(test))
  .then(report)


function namedVersion (version, index) {
  return modules[index] + '@' + version
}

function test (versions, index, size) {
  console.info('[%d/%d] installing %s...', index + 1, size, versions.join(' '));
  return client.call('install', versions)
    .then(function () {
      console.info('[%d/%d] testing...', index + 1, size)
      return checkTest().then(_.constant(true), _.constant(false))
    }, function (err) {
      console.error(err);
      console.info('[%d/%d] install failed.', index + 1, size)
      return false
    })
    .then(function (success) {
      console.info('[%d/%d] %s.', index + 1, size, success ? 'success' : 'failure')
      return success
    })
}

function checkTest () {
  return exec(config.test)
    .then(utils.debug('TEST'))
}

function report (results) {
  return combinations.then(function (versions) {
    var successes = results.map(function (result, i) {
      return {"versions": versions[i], "success": result}
    }).filter(_.property('success'))
    console.info(successes)
  })
}
