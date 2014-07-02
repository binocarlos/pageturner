var tools = require('./tools')

module.exports = factory

function factory(pages){
  return new Book(pages)
}

function Book(pages){
  this.pages = pages
  this.currentPage = 0
}

Emitter(Book.prototype)

// create a pair of leaves and populate this.pages
Book.prototype.nextPage = function(direction){
  return this.currentPage
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

  this.book.pages.forEach(function(page, i){
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