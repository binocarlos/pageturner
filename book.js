var tools = require('./tools')
var Emitter = require('emitter')
var Animator = require('./animator')
var Page = require('./page')

module.exports = factory

function factory(pages){
  return new Book(pages)
}

function Book(options){
  this._options = options || {}
  this._currentPage = 0
  this._is3d = tools.is3d()
  this.animator = Animator(this._options)
}

Emitter(Book.prototype)

Book.prototype.setData = function(pageData){
  pageData = pageData || []
  this._pages = pageData.map(function(data){
    if(typeof(data)==='string'){
      data = {
        html:data
      }
    }
  })
}

Book.prototype.is3d = function(){
  return this._is3d
}

Book.prototype.pages = function(){
  return this._pages
}

Book.prototype.currentPage = function(newValue){
  if(arguments.length>=1){
    this._currentPage = newValue
  }
  return this._currentPage
}

Book.prototype.getLeaves = function(offset){
  offset = offset || 0
  var index = this.getNextPageNumber(offset)
  if(index<0){
    return null
  }
  var page = this._pages[index]
  return page.render()
}

Book.prototype.getNextPageNumber = function(direction){
  var nextpage = this._currentPage + direction;
  if(nextpage<0){
    return -1
  }
  if(nextpage>this._pages.length-1){
    return -1
  }
  return nextpage
}

Book.prototype.loadPage = function(index){
  this.currentpage = index
  this.is3d ? this.load3dPage(index) : this.loadFlatPage(index)
}

Book.prototype.loadFlatPage = function(index){
  this._pages.forEach(function(page, i){
    page.setVisible(i==index)
  })
}

Book.prototype.load3dPage = function(parent, index, renderAhead){
  var min = index - renderAhead
  var max = index + renderAhead
  if(min<0){
    min = 0
  }
  if(max>this._pages.length-1){
    max = this._pages.length-1
  }
  this._pages.forEach(function(page, i){
    if(i>=min && i<=max){
      page.attach(parent)
      page.setVisible(i==index)
      if(i>index){
        page.setRotation('left', 180)
      }
      else if(i<index){
        page.setRotation('right', -180)
      }
    }
    else{
      page.remove()
    }
  })
}