var tools = require('./tools')
var Emitter = require('emitter')
var Animator = require('./animator')
var Page = require('./page')

module.exports = factory

function factory(options){
  return new Book(options)
}

function Book(options){
  this._options = options || {}
  this._currentPage = 0
  this._active = true
  this._animator = Animator(this._options)
}

Emitter(Book.prototype)

Book.prototype.setData = function(pageData){
  pageData = pageData || []
  this._pages = pageData.map(function(data){
    return Page(data)
  })
}

Book.prototype.setElement = function(elem){
  this._elem = elem
  this._leaves = this._elem.querySelector('#leaves')
  if(tools.is3d()){
    tools.setPerspective(this._leaves, this._options.perspective)  
  }
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

Book.prototype.loadPage = function(index, done){
  this._currentPage = index
  this.emit('page', index)
  tools.is3d() ? this.load3dPage(index, done) : this.loadFlatPage(index, done)
}

Book.prototype.loadFlatPage = function(index, done){
  this._pages.forEach(function(page, i){
    page.setVisible(i==index)
  })
  done && done()
}

Book.prototype.load3dPage = function(index, done){
  var self = this;
  var min = index - this._options.renderAhead
  var max = index + this._options.renderAhead
  if(min<0){
    min = 0
  }
  if(max>this._pages.length-1){
    max = this._pages.length-1
  }
  this._pages.forEach(function(page, i){
    if(i>=min && i<=max){
      page.attach(self._leaves)
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
  done && done()
}

Book.prototype.turnToPage = function(index, done){

  var self = this;
  function nextPage(){
    if(self._currentPage==index){
      done && done()
      return;
    }

    var direction = index>self._currentPage ? 1 : -1
    self.turnDirection(direction, nextPage)
  }

  nextPage()
}

Book.prototype.turnDirection = function(direction, done){
  var self = this;
  if(!this._active){
    this._finishfn = function(){
      console.log('run fuinish fn')
      self.turnDirection(direction, done)
    }
    return
  }
  
  var nextpage = this.getNextPageNumber(direction)
  var side = tools.directionToSide(direction)

  if(nextpage<0){
    done && done()
    return
  }

  this._active = false
  this._animator(side, function(i){
    return self.getLeaves(i)
  }, function(){
    self.loadPage(nextpage, function(){
      if(self._finishfn){
        self._finishfn()
        self._finishfn = null
      }
      else{
        self._active = true
        done && done()
      }
    })
  })
}