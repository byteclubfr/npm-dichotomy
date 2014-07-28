var npm = require('./npm')
var _ = require('lodash')
var Promise = require('bluebird')
var utils = require('./utils')
var exec = Promise.promisify(require('child_process').exec)

module.exports = function (config, stdout, stderr) {
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

  return Promise.all([combinations, setup])
    .spread(utils.series(test))
    .then(report)


  function namedVersion (version, index) {
    return modules[index] + '@' + version
  }

  function info (index, size, text) {
    stdout.write('[' + (index + 1) + '/' + size + '] ' + text + '\n');
  }

  function test (versions, index, size) {
    info(index, size, 'installing ' + versions.join(' ') + '...');
    return client.call('install', versions)
      .then(function () {
        info(index, size, 'testing...')
        return checkTest().then(_.constant(true), _.constant(false))
      }, function (err) {
        stderr.write(err.stack || String(err) + '\n');
        info(index, size, 'install failed.')
        return false
      })
      .then(function (success) {
        info(index, size, success ? 'success' : 'failure')
        return success
      })
  }

  function checkTest () {
    return exec(config.test)
      .then(utils.debug('TEST'))
  }

  function report (results) {
    return combinations.then(function (versions) {
       return results.map(function (result, i) {
        return {"versions": versions[i], "success": result}
      })
    })
  }
}
