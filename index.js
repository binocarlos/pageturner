/*

  Page Turner




                        ---------------- Turning Pair (a single page turn = 2 leafs turning at the same time)
                        |         |       
                        \        /
                        |\      /| ----- Turning Leaf (one of the 4 hot pages as 1/2 of a book page)
                        | \    / |  
                        |  \  /  |
    --------------------|--------|-------------------
    |                   |   |    |                  |
    |                   |   |    |                  | ---- Base leaf (single sided leaf from prev / next page)
    |                   |   |    |                  |
    |                   |   |    |                  |
    |                   |   |    |                  |
    |                   |   |    |                  |
    |                   |   |    |                  |
    |                   |   |    |                  |
    |                   |   |    |                  |
    |                   |   |    |                  |
    |                    \  |  /                    |
    |                     \ | /                     |
    |                      \|/                      |
    -------------------------------------------------




    -------------------------------------------------
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    -------------------------------------------------
    
  
  
*/

var Emitter = require('emitter');
var $ = require('jquery');
var transform = require('transform-property');
var has3d = require('has-translate3d');
var transEndEventName = require("transitionend");
var afterTransition = require('after-transition');

var template = require('./templates/booktemplate.js');

module.exports = PageTurner;

var options_defaults = {
  masksize:5,
  animtime:1200,
  perspective:800
}

function PageTurner(options){
  options = this.options = options || {};

  for(var prop in options_defaults){
    if(options[prop]===null || options[prop]===undefined){
      options[prop] = options_defaults[prop];
    }
  }

  if (!(this instanceof PageTurner)) return new PageTurner(options);

  var self = this;

  Emitter.call(this);

  this.options = options;
  this.is3d = options.has3d;

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

  /*
  
    #base

    the DOM element that holds our underneath leaves

    -------------------------------------------------
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |       base left       |       baseright       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    -------------------------------------------------
    
    
  */
  this.base = this.book.find('#base');

  /*
  
    #leaves

    the DOM element that holds our page turning leaves

    we have 2 leaves '#back' and '#forward' - each meaning a direction the book is turning

    -------------------------------------------------
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |     leafleftfront     |     leafrightfront    |
    |     leafleftback      |     leafrightback     |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    |                       |                       |
    -------------------------------------------------
    
    
  */
  this.leaves = this.book.find('#leaves');

  var edgeelem = $('<div class="leafholder maintain3d"><div class="leafedge"></div></div>');
  this.edge = edgeelem;
  
  setRotation(this.edge.find('.leafedge'), 90);

  

  setPerspective(this.leaves, this.options.perspective);
  
  

  this.resize();
  this.load_page(this.options.startpage || 0);

  var resizingID = null;

  $(window).resize(function(){
    if(resizingID){
      clearTimeout(resizingID);
    }
    resizingID = setTimeout(function(){
      self.resize();
    }, 100)
    
  })
}

PageTurner.prototype.resize = function(){
  this.size = {
    width:this.book.width(),
    height:this.book.height()
  }

  this.base.width(this.size.width).height(this.size.height);

  if(this.is3d){
    this.leaves.width(this.size.width).height(this.size.height);
    this.book.find('.leaf, .leafholder').width(this.size.width).height(this.size.height);  
  }
  

  this.emit('resize', this.size);
}

PageTurner.prototype.get_page_html = function(index){
  return (this.page_html[index] || '').replace(/>undefined</g, '><');
}

/*

  create the DOM structure ready for page X to turn +/- 1


  
*/
PageTurner.prototype.load_page = function(index){
  var self = this;
  
  self.emit('load', index);
  this.currentpage = index;

  /*
  
    create the base leaves

    if we are not 3d then these are the actual pages
    
  */
  this.baseleft = this.create_leaf('left', this.get_page_html(this.is3d ? index-1 : index)).css({
    display:'block'
  })
  this.baseright = this.create_leaf('right', this.get_page_html(this.is3d ? index+1 : index)).css({
    display:'block'
  })

  if(this.is3d){

    this.leftback = this.create_leaf('right', this.get_page_html(index-1), true).css({
      display:'block'
    })
    this.leftfront = this.create_leaf('left', this.get_page_html(index), true).css({
      display:'block'
    })

    this.rightback = this.create_leaf('left', this.get_page_html(index+1), true).css({
      display:'block'
    })
    this.rightfront = this.create_leaf('right', this.get_page_html(index), true).css({
      display:'block'
    })

    //this.leafleft = this.create_double_leaf(this.page_html[index-1], this.page_html[index]);
    //this.leafright = this.create_double_leaf(this.page_html[index], this.page_html[index+1]);
  }
  
  var existingbase = this.base.find('.leaf');
  var existingleaves = this.leaves.find('.leaf');

  this.base.prepend(this.baseright).prepend(this.baseleft);

  self.processmask(this.baseleft, 1);
  self.processmask(this.baseright, 1);

  if(this.is3d){

    self.processmask(this.leftfront);
    self.processmask(this.rightfront);
    self.processmask(this.leftback);
    self.processmask(this.rightback);

    setRotation(this.leftback, 90);
    setRotation(this.rightback, 90);
    
    this.leaves.append(this.leftfront)
    this.leaves.append(this.rightfront);
    this.leaves.append(this.leftback)
    this.leaves.append(this.rightback);
  }

  this.leaves.append(this.edge);

  setTimeout(function(){

    existingbase.fadeOut(200, function(){
      existingbase.remove();
    })

    if(self.is3d){
      existingleaves.fadeOut(200, function(){
        existingleaves.remove();
      })
    }

    setTimeout(function(){
      self.active = true;
      self.emit('loaded', index);
    }, 200)
  }, 200);
}

PageTurner.prototype.processmask = function(leaf, val){
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

/*

  create an element that is one page of content masked either left or right
  
*/
PageTurner.prototype.create_leaf = function(side, html, withedge){
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
PageTurner.prototype.set_leaf_rotation = function(side, percent){
  var leaf = this['leaf' + side];

  var rotation = side=='left' ? (percent * 180) : (180 - (percent * 180));

  setRotation(leaf, rotation);
}


/*

  animate the book sequentially either left (-1) or right (1)
  
*/
PageTurner.prototype.animate_direction = function(direction, nextpage){
  var self = this;
  if(!self.active){
    return;
  }

  if(arguments.length<=1){
    nextpage = this.currentpage + direction;  

    if(nextpage<0 || nextpage>=this.page_html.length){
      return;
    }
  }

  var side = direction<0 ? 'left' : 'right';
  var otherside = (side=='left' ? 'right' : 'left');

  if(!this.is3d){
    self.emit('animate', side, nextpage);
    self.emit('animated', side, nextpage);
    this.load_page(nextpage);
    return;
  }

  console.log('-------------------------------------------');
  console.log('here');
  console.log(side);

  var direction = side=='left' ? 1 : -1;

  setRotation(this[side + 'front'], direction * 75);

/*
  var frontleaf = this[side + 'front'];
  var backleaf = this[side + 'back'];

  self.active = false;  


  leaf.find('.leaf').each(function(i){
    self.processmask($(this), self.options.masksize);
  })


  setupAnimator(frontleaf, self.options.animtime, function(){
    console.log('-------------------------------------------');
    console.log('animate callback!');
  });

  setRotation(frontleaf, side=='left' ? 45 : 45);

//  self.emit('animate', side, nextpage);

  setTimeout(function(){
    self.emit('animated', side, nextpage);
    self.load_page(nextpage);
  }, self.options.animtime + 10)
*/

}






/*

  animate the book after having shifted the pages around so a non-sequential page is the target
  
*/
PageTurner.prototype.animate_index = function(index){
  var self = this;

  var side = index>this.currentpage ? 'right' : 'left';
  var direction = index>this.currentpage ? 1 : -1;
  var leafname = index>this.currentpage ? 'afterleaf' : 'beforeleaf';

  if(!this.is3d){
    self.emit('animate', side, index);
    self.emit('animated', side, index);
    this.load_page(index);
    return;
  }

  var basehtml = this.get_page_html(index);
  var base = this['base' + side];
  base.find('.content').html(basehtml);

  var leaf = this['leaf' + side];
  leaf.find('.' + leafname + ' .content').html(basehtml);
  setTimeout(function(){
    self.animate_direction(direction, index);
  }, 500)
}




function setLeafTransform(elem){
  var el = elem.get(0);

  var rotation = elem._rot || 0;
  var z = elem._z || 0;

  if (transform) {
    if (has3d) {
      var props = [];

      if(rotation!=0){
        props.push('rotateY(' + rotation + 'deg)');
      }

      if(z!=0){
        props.push('translateZ(' + z + 'px)');
      }

      var propsst = props.join(' ');

      el.style[transform] = propsst;
    } else {
      //el.style[transform] = 'translate(' + x + 'px,' + y + 'px)';
    }
  } else {
    //el.style.left = x;
    //el.style.top = y;
  }
}

function setZ(elem, amount){
  elem._z = amount;
  setLeafTransform(elem);
}

function setRotation(elem, amount){
  elem._rot = amount;
  setLeafTransform(elem);
}

function setupAnimator(elem, ms, fn){
  ['', '-webkit-', '-moz-', '-ms-', '-o-'].forEach(function(prefix){
    elem.css(prefix + 'transition', 'all ' + ms + 'ms');
  })

  afterTransition.once(elem.get(0), function(){
    console.log('-------------------------------------------');
    console.log('-------------------------------------------');
    console.log('done it!');
  });
}

function setPerspective(elem, amount){
  ['', '-webkit-', '-moz-', '-ms-', '-o-'].forEach(function(prefix){
    elem.css(prefix + 'perspective', amount + 'px');
  })
}