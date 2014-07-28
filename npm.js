var npm = require('npm')
var Promise = require('bluebird')
var _ = require('lodash')


var _client;

module.exports = function getClient () {
  if (!_client) {
    _client =   Promise.promisify(npm.load)({
      "loglevel": "silent"
    }).then(clientApi)
  }

  return _client
}


function clientApi (npm) {
  var cmdView = Promise.promisify(npm.commands.view, npm.commands)
  var cmdInstall = Promise.promisify(npm.commands.install, npm.commands)

  return {
    "view":     view,
    "install":  install
  }

  function view (module, field) {
    return cmdView([module, field], true).then(extract(field))
  }

  function install (modules) {
    if (!_.isArray(modules)) {
      modules = [modules]
    }

    return cmdInstall(modules)
  }
}

function extract (field) {
  return function (pkgInfo) {
    var pkg = pkgInfo[Object.keys(pkgInfo)[0]]

    if (field) {
      return pkg[field];
    } else {
      return pkg;
    }
  }
}
