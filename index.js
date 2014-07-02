var Emitter = require('emitter');
var tools = require('./tools')
/*
var $ = require('jquery');
var transform = require('transform-property');

var transEndEventName = require("transitionend");
var afterTransition = require('after-transition');
*/



var template = [
  '<div class="pageturner-book">',
  '  <div id="leaves">',

  '  </div>',
  '</div>'
].join("\n");

module.exports = function(elem, pageSelector, options){
  return new PageTurner(elem, pageSelector, options)
}

var options_defaults = {
  masksize:5,
  animtime:400,
  perspective:800
}

function PageTurner(elem, pageSelector, options){
  this.elem = elem
  this.pageSelector = pageSelector

  this.pages = this.elem.querySelectorAll(this.pageSelector);

  if(this.pages.length<=0){
    throw new Error('pageturner cannot find any pages for the book');
  }

  options = this.options = options || {};

  Object.keys(options_defaults || {}).forEach(function(prop){
    if(options[prop]===null || options[prop]===undefined){
      options[prop] = options_defaults[prop];
    }
  })

  this.is3d = tools.is3d()
  
  this.page_html = [];
  this.pages = [];
  this.currentpage = 0;
}

Emitter(PageTurner.prototype)

PageTurner.prototype.render = function(target){
  var self = this;

  target = target || this.elem
  
  this.pages.forEach(function(page){
    console.log('-------------------------------------------');
    console.dir(page)
  })
}