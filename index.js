var Emitter = require('emitter')
var domify = require('domify')
var css = require('css')
var tools = require('./tools')
var template = require('./template')

module.exports = factory

function factory(options){
  return new PageTurner(getOptions(options))
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

var options_defaults = {
  masksize:5,
  animtime:400,
  perspective:800
}

function PageTurner(options){
  this.options = options
  this.is3d = tools.is3d()
  this.currentpage = 0
  this.pages = []
}

Emitter(PageTurner.prototype)

// process the page divs so we have the HTML for them
PageTurner.prototype.load = function(elem, pageSelector){
  this.pages = []

  var pageResults = elem.querySelectorAll(pageSelector)

  for(var i=0; i<pageResults.length; i++){
    this.pages.push(Page(pageResults[i].outerHTML))
  }

  if(this.pages.length<=0){
    throw new Error('pageturner cannot find any pages for the book');
  }
}

PageTurner.prototype.render = function(){
  var self = this;

  if(this.elem){
    return this.elem
  }

  this.elem = domify(template)
  this.leaves = this.elem.querySelector('#leaves')

  if(this.is3d){
    tools.setPerspective(this.leaves, this.options.perspective)  
  }
  
  self.pages.forEach(function(page){
    console.log('-------------------------------------------');
    console.dir(page)
  })

  return this.elem[0]
}

PageTurner.prototype.loadPage = function(index){

}