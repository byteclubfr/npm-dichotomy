#!/usr/bin/env node

var npmDichotomy = require('../index')
var utils = require('../utils')
var _ = require('lodash')
var path = require('path')

var stdout = process.stdout;
var stderr = process.stderr;
var config = require(process.argv[2] || path.resolve('npm-dichotomy.json'));

npmDichotomy(config, stdout, stderr)
  .then(utils.filter(_.property('success')))
  .then(console.log)
