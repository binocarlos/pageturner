var Emitter = require('emitter')
var domify = require('domify')
var css = require('css')
var tools = require('./tools')

module.exports = factory

function factory(data){
  return new Page(data)
}

function Page(data){
  if(typeof(data)==='string'){
    data = {
      html:data
    }
  }
  this._html = data.html
  this._meta = data
}

Emitter(Page.prototype)

// create a pair of leaves and populate this.pages
Page.prototype.render = function(){
  var self = this;
  
  if(this.leaves){
    return this.leaves
  }

  this.leaves = {
    left:this.createLeaf('left'),
    right:this.createLeaf('right')
  }

  this.emit('render', this.leaves)

  return this.leaves
}


Page.prototype.createLeaf = function(side){
  var leaf = domify('<div class="leaf nobackside filler maintain3d"><div class="content filler">' + this._html + '</div></div>')
  leaf.setAttribute('data-side', side)
  return leaf;
}

/*

  manually set the rotation of either side

  i.e. 'left', .89

  would turn the left hand side .89 * 180 degrees to the right

  i.e. 'right', .89

  would turn the left hand side 180 - (.89 * 180) degrees to the right
  
*/
Page.prototype.setLeafRotation = function(side, percent){
  var leaf = this['leaf' + side];

  var rotation = side=='left' ? (percent * 180) : (180 - (percent * 180));

  setRotation(leaf, rotation);
}


Page.prototype.processMask = function(leaf, val, parent){

  if(!parent){
    return;
  }
  setTimeout(function(){
    var size = {
      width:parent.offsetWidth,
      height:parent.offsetHeight
    }

    var usemask = arguments.length==2 ? val : 0;

    // clip: rect(<top>, <right>, <bottom>, <left>);
    var rect = leaf.getAttribute('data-side') == 'left' ? 
      'rect(0px, ' + (Math.ceil(size.width/2)+usemask) + 'px, ' + (size.height) + 'px, 0px)' :
      'rect(0px, ' + (size.width) + 'px, ' + (size.height) + 'px, ' + (Math.floor(size.width/2)-usemask) + 'px)'

    css(leaf, {
      'clip':rect
    })
  }, 1)
  
}


Page.prototype.resize = function(){
  if(tools.is3d()){
    var page = this.render()
    this.processMask(page.left, 0, this._parent)
    this.processMask(page.right, 0, this._parent)  
  }
}

Page.prototype.attach = function(parent){
  var page = this.render()
  parent.appendChild(page.left)
  this._parent = parent
  if(tools.is3d()){
    parent.appendChild(page.right)
    this.resize()
  }
}


Page.prototype.remove = function(){
  var page = this.render()
  if(page.left.parentNode){
    page.left.parentNode.removeChild(page.left)  
  }
  if(page.right.parentNode){
    page.right.parentNode.removeChild(page.right)
  }
}

Page.prototype.setStack = function(mode){
  var o = mode ? '1' : '0';
  var leaves = this.render()
  css(leaves.left, {
    'z-index':o
  })
  css(leaves.right, {
    'z-index':o
  })
}

Page.prototype.setVisible = function(mode){
  var o = mode ? '1' : '0';
  var leaves = this.render()

  var props = {}

  if(tools.is3d()){
    props.opacity = o
  }
  else{
    props.display = mode ? 'block' : 'none'
  }
  css(leaves.left, props)
  css(leaves.right, props)
}

Page.prototype.setRotation = function(side, amount){
  if(tools.is3d()){
    var leaves = this.render()
    tools.setRotation(leaves[side], amount)
  }
}