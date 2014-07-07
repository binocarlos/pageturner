var tools = require('./tools')
var Emitter = require('emitter')

module.exports = factory

function factory(pages){
  return new Book(pages)
}

function Book(pages){
  this.pages = pages
  this.currentPage = 0
}

Emitter(Book.prototype)

Book.prototype.getLeaves = function(offset){
  offset = offset || 0
  var index = this.getNextPageNumber(offset)
  if(index<0){
    return null
  }
  var page = this.pages[index]
  return page.render()
}

Book.prototype.getNextPageNumber = function(direction){
  var nextpage = this.currentPage + direction;
  if(nextpage<0){
    return -1
  }
  if(nextpage>this.pages.length-1){
    return -1
  }
  return nextpage
}

Book.prototype.load3dPage = function(parent, index, renderAhead){
  var min = index - renderAhead
  var max = index + renderAhead
  if(min<0){
    min = 0
  }
  if(max>this.pages.length-1){
    max = this.pages.length-1
  }
  this.pages.forEach(function(page, i){
    
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