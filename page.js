var Emitter = require('emitter')
var domify = require('domify')
var css = require('css')
var tools = require('./tools')
var template = require('./pagetemplate')

module.exports = factory

function factory(options){
  return new Page(options)
}

function Page(options){
  this.options = options
}

Emitter(Page.prototype)

// create a pair of leaves and populate this.pages
Page.prototype.render = function(index){
  var self = this;
  if(this.pages[index]){
    return this.pages[index];
  }
  var page = this.pages[index] = {
    left:this.create_leaf('left', this.get_page_html(index)),
    right:this.create_leaf('right', this.get_page_html(index))
  }

  this.leaves.append(this.pages[index].left);
  this.leaves.append(this.pages[index].right);

  if(this.is3d){

    self.processmask(page.left, 0);
    self.processmask(page.right, 0);
  }

  return this.pages[index];
}

Page.prototype.createLeaf = function(elem, pageSelector){
  var leaf = $('<div class="leaf nobackside"><div class="content">' + html + '</div></div>');
  if(this.options.apply_pageclass){
    leaf.find('.content').addClass(this.options.apply_pageclass);
  }
  leaf.attr('data-side', side);
  leaf.width(this.size.width).height(this.size.height);
  
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


Page.prototype.processmask = function(leaf, val){
  var size = this.size;

  var usemask = arguments.length==2 ? val : 0;

  // clip: rect(<top>, <right>, <bottom>, <left>);
  var rect = leaf.attr('data-side') == 'left' ? 
    'rect(0px, ' + (Math.ceil(size.width/2)+usemask) + 'px, ' + (size.height) + 'px, 0px)' :
    'rect(0px, ' + (size.width) + 'px, ' + (size.height) + 'px, ' + (Math.floor(size.width/2)-usemask) + 'px)'

  leaf.css({
    'clip':rect
  }) 
}
