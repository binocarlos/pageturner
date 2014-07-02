var Emitter = require('emitter')
var domify = require('domify')
var tools = require('./tools')
var template = require('./template')

/*
var $ = require('jquery');
var transform = require('transform-property');

var transEndEventName = require("transitionend");
var afterTransition = require('after-transition');
*/


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
  this.page_html = options.html || []
}

//Emitter(PageTurner.prototype)

// process the page divs so we have the HTML for them
PageTurner.prototype.load = function(elem, pageSelector){
  this.page_html = []

  var pageResults = elem.querySelectorAll(pageSelector)

  for(var i=0; i<pageResults.length; i++){
    this.page_html.push(pageResults[i].outerHTML)
  }

  if(this.page_html.length<=0){
    throw new Error('pageturner cannot find any pages for the book');
  }
}

PageTurner.prototype.render = function(){
  var self = this;

  if(this.elem){
    return this.elem
  }

  this.elem = domify(template)

  self.page_html.forEach(function(page){
    console.log('-------------------------------------------');
    console.dir(page)
  })

  return this.elem[0]
}