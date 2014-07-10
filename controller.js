var Emitter = require('emitter')
var domify = require('domify')
var css = require('css')
var tools = require('./tools')
var template = require('./template')
var Book = require('./book')

module.exports = PageTurner

function PageTurner(options){
  var self = this;
  this.options = options
  this.book = Book(this.options)
  this.setupEvents()
}

Emitter(PageTurner.prototype)

function sortArgs(a){
  var args = Array.prototype.slice.call(a, 0);
  return args.sort();
}

PageTurner.prototype.setupEvents = function(){
  var self = this;
  [
    'render:leaf',
    'data',
    'view:index',
    'view:leaf',
    'turn:start',
    'turn:end'
  ].forEach(function(name){
    self.book.on(name, function(){
      var args = sortArgs(arguments)
      self.emit.apply(self, [name].concat(args))
    })
  })
}

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

PageTurner.prototype.getPages = function(){
  return this.book.pages()
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

PageTurner.prototype.appendTo = function (target) {
  if (typeof target === 'string') target = document.querySelector(target)
  target.appendChild(this.render())
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
  this.book.setElement(this.elem)

  if(target){
    target.innerHTML = ''
    target.appendChild(this.elem)
  }

  writeBookToTarget(this.elem)

  this.emit('render:book', this.elem)
  return this.elem
}

PageTurner.prototype.loadPage = function(index){
  if(!this.elem){
    throw new Error('you must call .render() before you can call loadPage')
  }
  this.book.loadPage(index)
}

PageTurner.prototype.turnDirection = function(direction, done){
  return this.book.turnDirection(direction, function(){
    done && done()
  })
}

PageTurner.prototype.turnToPage = function(index, done){
  return this.book.turnToPage(index, function(){
    done && done()
  })
}