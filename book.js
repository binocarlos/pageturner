var tools = require('./tools')
var Emitter = require('emitter')
var Animator = require('./animator')
var Page = require('./page')
var resize = require('resize')

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
  var self = this;
  pageData = pageData || []
  this._pages = pageData.map(function(data, index){
    var page = Page(data)
    page.on('render', function(leaves){
      self.emit('render:leaf', leaves.left, 'left', index)
      self.emit('render:leaf', leaves.right, 'right', index)
    })
    return page
  })
  this.emit('data', pageData)
}

Book.prototype.setElement = function(elem){
  var self = this;
  this._elem = elem
  this._leaves = this._elem.querySelector('#leaves')
  if(tools.is3d()){
    tools.setPerspective(this._leaves, this._options.perspective)  
    resize.bind(this._leaves, function(){
      setTimeout(function(){
        self._pages.forEach(function(page){
          page.resize()
        })  
      }, 2)
      
    })
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

var sideDirections = {
  left:-1,
  right:1
}

Book.prototype.getNextPageNumber = function(direction){
  if(typeof(direction)==='string'){
    direction = sideDirections[direction]
  }
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
  tools.is3d() ? this.load3dPage(index, done) : this.loadFlatPage(index, done)
  var page = this._pages[index]
  var leaves = page.render()
  this.emit('view:index', index, this._pages.length)
  this.emit('view:leaf', leaves.left, 'left', index)
  this.emit('view:leaf', leaves.right, 'right', index)
}

Book.prototype.loadFlatPage = function(index, done){
  var self = this;
  this._pages.forEach(function(page, i){
    page.attach(self._leaves)
    page.setVisible(i==index)
  })
  done && done()
}


Book.prototype.load3dPage = function(index, done){
  var self = this;
  var min = index - Math.ceil(this._options.renderAhead/2)
  var max = index + Math.ceil(this._options.renderAhead/2)
  if(min<0){
    min = 0
  }
  if(max>this._pages.length-1){
    max = this._pages.length-1
  }
  this._pages.forEach(function(page, i){
    if(i>=min && i<=max && i!=index){
      page.setVisible(false)
      page.setStack(false)
      page.attach(self._leaves)
      if(i>index){
        page.setRotation('left', 180)
        page.setRotation('right', 0)
      }
      else if(i<index){
        page.setRotation('left', 0)
        page.setRotation('right', -180)
      }
    }
    else{
      page.remove()
    }
  })
  var activePage = this._pages[index]
  activePage.setVisible(true)
  activePage.setStack(true)
  activePage.attach(self._leaves)
  
  activePage.setRotation('left', 0)
  activePage.setRotation('right', 0)
  done && done()
}

Book.prototype.turnToPage = function(index, done){

  var self = this;

  if(!tools.is3d()){
    self.loadPage(index, done)
  }
  else{
    function nextPage(){
      if(self._currentPage==index){
        done && done()
        return;
      }

      var direction = index>self._currentPage ? 1 : -1
      self.turnDirection(direction, true, nextPage)
    }

    nextPage()    
  }


  return index
}

Book.prototype.turnDirection = function(direction, quickMode, done){
  var self = this;

  if(!done){
    done = quickMode
    quickMode = false
  }

  if(!this._active){
    this._finishfn = function(){
      this._active = true
      self.turnDirection(direction, done)
    }
    return
  }
  
  var nextpage = this.getNextPageNumber(direction)
  var side = tools.directionToSide(direction)

  this.emit('turn:start', this._currentPage, nextpage, direction)

  if(nextpage<0){
    done && done()
    return
  }

  this._active = false

  function loadNextPage(){
    self.loadPage(nextpage, function(){
      if(self._finishfn){
        self._finishfn()
        self._finishfn = null
      }
      else{
        self.emit('turn:end', self._currentPage, nextpage, direction)
        self._active = true
        done && done()
      }
    })
  }

  if(tools.is3d()){
    this._animator(side, function(i){
      return self.getLeaves(i)
    }, quickMode, loadNextPage)
  }
  else{
    loadNextPage()
  }
  
  return nextpage
}