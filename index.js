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

function getOptions(options){

  options = options || {};

  Object.keys(options_defaults || {}).forEach(function(prop){
    if(options[prop]===null || options[prop]===undefined){
      options[prop] = options_defaults[prop];
    }
  })

  return options
}

module.exports = function(options){
  return new PageTurner(options)
}

var options_defaults = {
  masksize:5,
  animtime:400,
  perspective:800
}

function PageTurner(options){
  this.options = getOptions(options)
  this.is3d = tools.is3d()
  this.currentpage = 0
  this.page_html = options.html || []
}

//Emitter(PageTurner.prototype)

// process the page divs so we have the HTML for them
PageTurner.prototype.load = function(elem, pageSelector){
  this.page_html = []

  var pageResults = this.elem.querySelectorAll(this.pageSelector)

  for(var i=0; i<pageResults.length; i++){
    this.page_html.push(pageResults[i].outerHTML)
  }

  if(this.page_html.length<=0){
    throw new Error('pageturner cannot find any pages for the book');
  }
}

PageTurner.prototype.render = function(target){
  var self = this;

  target = target || self.elem

  self.pages.forEach(function(page){
    console.log('-------------------------------------------');
    console.dir(page)
  })

}