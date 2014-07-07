var Controller = require('./controller')

var options_defaults = {
  masksize:5,
  animtime:400,
  perspective:800,
  renderAhead:3
}

function getOptions(options){
  options = options || {};

  Object.keys(options_defaults || {}).forEach(function(prop){
    if(options[prop]===null || options[prop]===undefined){
      options[prop] = options_defaults[prop];
    }
  })

  return options
}

function factory(options){
  return new Controller(getOptions(options))
}

module.exports = factory