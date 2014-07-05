var Emitter = require('emitter')
var domify = require('domify')
var css = require('css')
var tools = require('./tools')
var template = require('./template')

var Book = require('./book')
var Page = require('./page')


var options_defaults = {
  masksize:5,
  animtime:400,
  perspective:800,
  renderAhead:3
}

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

function PageTurner(options){
  this.options = options
  this.is3d = tools.is3d()
  this.currentpage = 0

  this.pages = []
}

Emitter(PageTurner.prototype)

// process the page divs so we have the HTML for them
PageTurner.prototype.load = function(elem, pageSelector){
  var pages = []

  var pageResults = elem.querySelectorAll(pageSelector)

  for(var i=0; i<pageResults.length; i++){
    pages.push(Page(pageResults[i].outerHTML))
  }

  if(pages.length<=0){
    throw new Error('pageturner cannot find any pages for the book');
  }

  this.book = Book(pages)
}

PageTurner.prototype.loadAndReplace = function(elem, pageSelector){
  this.load(elem, pageSelector)
  elem.innerHTML = ''
  elem.appendChild(this.render())
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

  return this.elem
}

PageTurner.prototype.loadFlatPage = function(index){
  this.book.pages.forEach(function(page, i){
    page.setVisible(i==index)
  })
}

PageTurner.prototype.load3dPage = function(index){
  var self = this;
  var renderAhead = 
  this.book.load3dPage(this.leaves, index, this.options.renderAhead)
}

PageTurner.prototype.loadPage = function(index){
  if(!this.elem){
    throw new Error('you must call .render() before you can call loadPage')
  }
  this.currentpage = index
  this.is3d ? this.load3dPage(index) : this.loadFlatPage(index)
}