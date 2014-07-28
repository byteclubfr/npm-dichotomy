var semver = require('semver')
var _ = require('lodash')
var Combinatorics = require('js-combinatorics').Combinatorics;
var Promise = require('bluebird');


module.exports = {
  "DEBUG": false,
  "debug": debug,
  "info": info,

  "cartesian": Combinatorics.cartesianProduct,
  "checkVersions": checkVersions,
  "setProperty": setProperty,

  "filter": filter,
  "map": map,
  "series": series
}


function checkVersions (criteria) {
  return function (version) {
    return _.every(_.map(criteria, function (reference, comparison) {
      return semver[comparison](version, reference)
    }))
  }
}

function debug (prefix) {
  return function (value) {
    if (module.exports.DEBUG) {
      console.log(prefix, value)
    }

    return value
  }
}

function info (prefix) {
  return function (value) {
    console.info(prefix, value)

    return value
  }
}

function filter (fn) {
  return function (array) {
    return Promise.filter(array, fn)
  }
}

function map (fn) {
  return function (array) {
    return Promise.map(array, fn)
  }
}

function setProperty (property) {
  return function (factory) {
    if (!_.isFunction(factory)) {
      factory = _.constant(factory)
    }

    return function (value) {
      var object = factory()
      if (object) {
        object[property] = value
      }

      return object
    }
  }
}

function series (fn) {
  return function (array) {
    return Promise.reduce(array, function (results, value, index, size) {
      return Promise.cast(fn(value, index, size)).then(function (result) {
        return results.concat([result])
      })
    }, [])
  }
}
