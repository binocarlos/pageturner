/*

  PageHammer
  
*/

var Emitter = require('emitter');
var Hammer = require('hammer');
var $ = require('jquery');

var transform = require('transform-property');
var has3d = require('has-translate3d');

var template = require('./templates/booktemplate.js');

module.exports = PageTurner;

function setRotation(elem, amount){
  var el = elem.get(0);

  if (transform) {
    if (has3d) {
      el.style[transform] = 'rotateY(' + amount + 'deg)';
    } else {
      //el.style[transform] = 'translate(' + x + 'px,' + y + 'px)';
    }
  } else {
    //el.style.left = x;
    //el.style.top = y;
  }
}

function PageTurner(bookselector, pageselector){
  if (!(this instanceof PageTurner)) return new PageTurner(bookselector, pageselector);
  Emitter.call(this);
  var self = this;

  this.page_html = [];
  this.currentpage = 0;

  this.book = $(bookselector);

  this.book.find(pageselector).each(function(i){
    self.page_html.push($(this).html());
  })

  this.book.html(template);

  this.base = this.book.find('#base');
  this.leaves = this.book.find('#leaves');

  this.book.bind('resize', function(){
    self.resize();
  });

  this.resize();
  this.load_page(1);
}

/**
 * Inherit from `Emitter.prototype`.
 */

PageTurner.prototype = new Emitter;


PageTurner.prototype.resize = function(){
  this.size = {
    width:this.book.width(),
    height:this.book.height()
  }

  this.base.width(this.size.width).height(this.size.height);
  this.leaves.width(this.size.width).height(this.size.height);
  this.book.find('.leaf, .leafholder').width(this.size.width).height(this.size.height);
}

/*

  gets the set index of page written into the GUI
  
*/
PageTurner.prototype.load_page = function(index){
  var self = this;
  console.log('-------------------------------------------');
  console.log('loading page: ' + index);

  this.currentpage = index;

  var baseleft = this.create_leaf('left', this.page_html[index-1]);
  var baseright = this.create_leaf('right', this.page_html[index+1]);

  var leafleft = this.create_double_leaf(this.page_html[index-1], this.page_html[index]);
  var leafright = this.create_double_leaf(this.page_html[index], this.page_html[index+1]);
  
  var existingbase = this.base.find('> div');
  var existingleaves = this.leaves.find('> div');

  //this.base.append(baseleft).append(baseright);
  this.leaves.append(leafleft);//.append(leafright);

  console.log('-------------------------------------------');
  console.dir(leafleft);
  //setRotation(leafleft.find('.beforeleaf'), 20);
  setRotation(leafleft.find('.afterleaf'), -30);
  setRotation(leafleft, 30);

  this.book.find('.leaf').each(function(){
    self.processmask($(this));
  })

  setTimeout(function(){
    existingbase.remove();
    existingleaves.remove();
  }, 100);
}

PageTurner.prototype.processmask = function(leaf){
  var size = this.size;

  var rect = leaf.data('side') == 'left' ? 
    'rect(0px, ' + ((size.width/2) + 1) + 'px, ' + (size.height) + 'px, -20px)' :
    'rect(0px, ' + (size.width+20) + 'px, ' + (size.height) + 'px, ' + ((size.width/2)-1) + 'px)'

  leaf.css({
    'clip':rect
  }) 
}

/*

  create an element that is one page of content masked either left or right
  
*/
PageTurner.prototype.create_leaf = function(side, html){
  var leaf = $('<div class="leaf"><div class="content">' + html + '</div></div>');
  leaf.data('side', side);
  leaf.width(this.size.width).height(this.size.height);
  return leaf;
}

PageTurner.prototype.create_double_leaf = function(beforehtml, afterhtml){
  var beforeleaf = this.create_leaf('right', beforehtml);
  var afterleaf = this.create_leaf('left', afterhtml);
  beforeleaf.addClass('beforeleaf');
  afterleaf.addClass('afterleaf');
  var double_leaf = $('<div class="leafholder maintain3d"></div>');  
  double_leaf.width(this.size.width).height(this.size.height);
  double_leaf.append(beforeleaf).append(afterleaf);
  return double_leaf;
}

