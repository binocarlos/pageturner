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

function PageTurner(options){
  options = this.options = options || {};

  if (!(this instanceof PageTurner)) return new PageTurner(options);

  var self = this;
  Emitter.call(this);

  this.page_html = [];
  this.currentpage = 0;

  this.book = $(this.options.bookselector);

  if(this.book.length<=0){
    throw new Error('pageturner cannot find the element for the book');
  }
}

/**
 * Inherit from `Emitter.prototype`.
 */

PageTurner.prototype = new Emitter;

PageTurner.prototype.render = function(){
  var self = this;
  var pages = this.book.find(this.options.pageselector);

  if(pages.length<=0){
    throw new Error('pageturner cannot find any pages for the book');
  }

  pages.each(function(i){
    self.page_html.push($(this).html());
  })

  this.book.html(template);

  this.base = this.book.find('#base');
  this.leaves = this.book.find('#leaves');

  this.book.bind('resize', function(){
    self.resize();
  });

  this.resize();
  this.load_page(this.options.startpage || 0);

  this.base.hide();
}

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

  this.base.append(baseleft).append(baseright);
  this.leaves.append(leafleft);//.append(leafright);

  setRotation(leafleft, 10);

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
  var leaf = $('<div class="leaf nobackside"><div class="content">' + html + '</div></div>');
  if(this.options.pageclass){
    leaf.find('.content').addClass(this.options.pageclass);
  }
  leaf.data('side', side);
  leaf.width(this.size.width).height(this.size.height);
  return leaf;
}

PageTurner.prototype.create_double_leaf = function(beforehtml, afterhtml){
  var beforeleaf = this.create_leaf('right', beforehtml);
  var afterleaf = this.create_leaf('left', afterhtml);
  beforeleaf.addClass('beforeleaf');
  afterleaf.addClass('afterleaf');
  var double_leaf = $('<div class="leafholder maintain3d nobackside"></div>');  
  double_leaf.width(this.size.width).height(this.size.height);
  double_leaf.append(afterleaf).append(beforeleaf);
  setRotation(beforeleaf, 180);
  return double_leaf;
}

