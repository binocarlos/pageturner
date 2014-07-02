var Emitter = require('emitter')
var domify = require('domify')
var css = require('css')
var tools = require('./tools')

module.exports = factory

function factory(html){
  return new Page(html)
}

function Page(html){
  this.html = html
}

Emitter(Page.prototype)

// create a pair of leaves and populate this.pages
Page.prototype.render = function(){
  var self = this;
  
  if(this.page){
    return this.page
  }

  this.page = {
    left:this.createLeaf('left'),
    right:this.createLeaf('right')
  }

  return this.page
}

Page.prototype.attach = function(parent){
  var page = this.render()
  parent.appendChild(page.left)
  parent.appendChild(page.right)

  if(tools.is3d()){
    this.processmask(this.page.left, 0, parent)
    this.processmask(this.page.right, 0, parent)
  }
}

Page.prototype.remove = function(){
  var page = this.render()
  page.left.parentNode.removeChild(page.left)
  page.right.parentNode.removeChild(page.right)
}

Page.prototype.createLeaf = function(side){
  var leaf = domify('<div class="leaf nobackside filler"><div class="content filler">' + html + '</div></div>')
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


Page.prototype.processmask = function(leaf, val, parent){
  var size = {
    width:parent.offsetWidth,
    height:parent.offsetHeight
  }

  var usemask = arguments.length==2 ? val : 0;

  // clip: rect(<top>, <right>, <bottom>, <left>);
  var rect = leaf.attr('data-side') == 'left' ? 
    'rect(0px, ' + (Math.ceil(size.width/2)+usemask) + 'px, ' + (size.height) + 'px, 0px)' :
    'rect(0px, ' + (size.width) + 'px, ' + (size.height) + 'px, ' + (Math.floor(size.width/2)-usemask) + 'px)'

  leaf.css({
    'clip':rect
  })
}
