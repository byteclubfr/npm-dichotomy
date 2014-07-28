var npm = require('npm')
var Promise = require('bluebird')
var _ = require('lodash')


module.exports = load


function load () {
  return Promise.promisify(npm.load)({
    "loglevel": "silent"
  }).then(client)
}

function client (npm) {
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
