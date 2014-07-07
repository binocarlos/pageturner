var Emitter = require('emitter')
var domify = require('domify')
var css = require('css')
var tools = require('./tools')
var template = require('./template')
var Book = require('./book')

module.exports = PageTurner

function PageTurner(options){
  this.options = options
  this.book = Book(this.options)
}

Emitter(PageTurner.prototype)

// load either from a dom node or array of page objects with .html
PageTurner.prototype.load = function(data, pageSelector){
  if(!data.nodeName) {
    this.loadData(data)
  }
  else{
    this.loadElement(data, pageSelector)
  }
}

PageTurner.prototype.loadData = function(pageData){
  this.book.setData(pageData)
}

// process the page divs so we have the HTML for them
PageTurner.prototype.loadElement = function(elem, pageSelector){
  var pages = []

  var pageResults = elem.querySelectorAll(pageSelector)

  for(var i=0; i<pageResults.length; i++){
    pages.push({
      index:i,
      html:pageResults[i].outerHTML
    })
  }

  if(pages.length<=0){
    throw new Error('pageturner cannot find any pages for the book');
  }

  this.book.setData(pages)
}

PageTurner.prototype.render = function(target){
  var self = this;

  function writeBookToTarget(e){
    if(target){
      target.innerHTML = ''
      target.appendChild(e)
    }
  }

  if(this.elem){
    writeBookToTarget(this.elem)
    return this.elem
  }

  this.elem = domify(template)
  this.leaves = this.elem.querySelector('#leaves')

  if(tools.is3d()){
    tools.setPerspective(this.leaves, this.options.perspective)  
  }

  if(target){
    target.innerHTML = ''
    target.appendChild(this.elem)
  }

  writeBookToTarget(this.elem)
  return this.elem
}

PageTurner.prototype.loadPage = function(index){
  if(!this.elem){
    throw new Error('you must call .render() before you can call loadPage')
  }
  this.book.loadPage(index, this.leaves)
}

PageTurner.prototype.turnDirection = function(direction, done){
  this.book.turnDirection(direction, done)
}

PageTurner.prototype.turnToPage = function(index, done){

}