/*

  Page Turner


Turning Pair (a single page turn = 2 leafs turning at the same time)
One turns till halfway then triggers the other leaf (which is vertical)
to complete it's turn
                        |
                        |----------
                        |         |       
                        \        /
                        -        _ ----- Turning Leaf
                        -\      /_       (one of the 4 hot pages 
                        - \    / _       prev-right + current-left
                        -  \  /  _       next-left + current-right
    -----------------------------_-------------------
    |                   -   |    _                  |
    |                   -   |    _                  |
    |                   -   |    _                  |
    |                   -   |    _                  |
    |                   -   |    _                  |---- Base leaf 
    |                   -   |    _                  |     single sided 
    |                   -   |    _                  |     leafs from the
    |                   -   |    _                  |     prev / next pages
    |                   -   |    _                  |
    |                   -   |    _                  |
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

var template = [
  '<div class="pageturner-book">',
  '  <div id="leaves">',

  '  </div>',
  '</div>'
].join("\n");

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
  this.is3d = has3d && options.has3d;

  this.page_html = [];
  this.pages = [];
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

  this.leaves = this.book.find('#leaves');

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


/*

  create the DOM structure ready for page X to turn +/- 1


  
*/
PageTurner.prototype.load_page = function(index){
  var self = this;
  
  this.currentpage = index;

  var render_gap = this.options.render_gap || 3;
  var min = index - render_gap;
  var max = index + render_gap;
  if(min<0){
    min = 0;
  }
  if(max>this.page_html.length-1){
    max = this.page_html.length-1;
  }
  
  for(var i=0; i<this.page_html.length; i++){
    if(i>=min && i<=max){
      var page = this.create_page(i);
      var o = i==index ? 1 : 0;
      page.left.css({
        opacity:o
      })
      page.right.css({
        opacity:o
      })

      if(i==index){

      }
      else if(i>index){
        setRotation(page.left, 180);
      }
      else if(i<index){
        setRotation(page.right, -180);
      }
    }
    else{
      this.remove_page(i);
    }
  }

  self.emit('load', index);
  self.emit('loaded', index);
  self.emit('view:page', index);
}


// create a pair of leaves and populate this.pages
PageTurner.prototype.create_page = function(index){
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

// remove the DOM elements and edit this.pages
PageTurner.prototype.remove_page = function(index){
  if(!this.pages[index]){
    return;
  }

  var page = this.pages[index];
  page.left.remove();
  page.right.remove();
  delete(this.pages[index]);
}

PageTurner.prototype.animate_direction = function(direction, nextpage){
  var self = this;

  if(!self.active){
    return;
  }

  self.active = false;

  if(arguments.length<=1){
    nextpage = this.currentpage + direction;  

    if(nextpage<0 || nextpage>=this.page_html.length){
      self.emit('canceldrag');
      return;
    }
  }

  //this.emit('load', nextpage);

  var side = direction<0 ? 'left' : 'right';
  var otherside = (side=='left' ? 'right' : 'left');

  if(!this.is3d){
    self.emit('animate', side, nextpage);
    self.emit('animated', side, nextpage);
    this.load_page(nextpage);
    return;
  }

  var direction = side=='left' ? 1 : -1;

  var frontleaf = this.pages[this.currentpage].right;
  var backleaf = this.pages[this.currentpage + 1].left;

  if(side=='left'){

  }
  else{

    var frontleaf = this.pages[this.currentpage].right;
    var backleaf = this.pages[this.currentpage + 1].left;
    setupAnimator(frontleaf, 'before', self.options.animtime/2, function(){
    
    });

    setupAnimator(backleaf, 'before', self.options.animtime/2, function(){
      
    });

    backleaf.css({
      opacity:1
    })

    setRotation(frontleaf, -180);
    setRotation(backleaf, 0);  
  }

  
/*
  var frontleaf = this[side + 'front'];
  var backleaf = this[side + 'back'];
  var edge = this[side + 'edge'];

  setRotation(frontleaf, direction * 45);
  setRotation(edge, 45);//edge_middle_rotation);
*/  

  //self.processmask(frontleaf, 5);
  //self.processmask(backleaf, 5);

/*
  edge.css({
    opacity:0
  })

  setupAnimator(edge, 'after', self.options.animtime/2, function(){
    
    setupAnimator(edge, 'before', self.options.animtime/2, function(){
      
      

    })

    setTimeout(function(){
      edge.css({
        opacity:0
      })
    }, (3*self.options.animtime)/8);

    setRotation(edge, edge_target_rotation);  
    
  });

  setupAnimator(frontleaf, 'after', self.options.animtime/2, function(){

    frontleaf.css({
      opacity:0
    })

    backleaf.css({
      opacity:1
    })

    setupAnimator(backleaf, 'before', self.options.animtime/2, function(){

      self.emit('animated', side, nextpage);
      self.load_page(nextpage);
    })

    setRotation(backleaf, 0);
    
    
  });

  setTimeout(function(){
    edge.css({
      opacity:1
    })
  }, self.options.animtime/8);

  edge.css({
    opacity:1
  })

  self.emit('animate', side, nextpage);

  removeAnimator(backleaf);
*/

  

}


  /*
  
    create the base leaves

    if we are not 3d then these are the actual pages
    
  
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

  var frontexistingleaves = this.fronts.find('.leaf');
  var backexistingleaves = this.backs.find('.leaf');

  this.base.prepend(this.baseright).prepend(this.baseleft);

  self.processmask(this.baseleft, 0);
  self.processmask(this.baseright, 0);

  if(this.is3d){

    self.processmask(this.leftfront, 0);
    self.processmask(this.rightfront, 0);
    self.processmask(this.leftback, 0);
    self.processmask(this.rightback, 0);

    setRotation(this.leftback, -90.1);
    setRotation(this.rightback, 89.9);
    this.leftback.css({
      opacity:0
    })
    this.rightback.css({
      opacity:0
    })
    
    
    this.fronts.append(this.rightfront);
    this.fronts.append(this.leftfront)

    
    this.backs.append(this.rightback);
    this.backs.append(this.leftback)

    this.emit('pagebuilt', index);
  }


  setTimeout(function(){

    existingbase.fadeOut(100, function(){
      existingbase.remove();
    })

    if(self.is3d){
      frontexistingleaves.fadeOut(100, function(){
        frontexistingleaves.remove();
      })
      backexistingleaves.fadeOut(100, function(){
        backexistingleaves.remove();
      })
    }

    setTimeout(function(){
      self.active = true;
      self.emit('loaded', index);
    }, 100)
  }, 500);

  this.build_edges();
  */


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
PageTurner.prototype.create_leaf = function(side, html){
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


PageTurner.prototype.get_page_html = function(index){
  return (this.page_html[index] || '').replace(/>undefined</g, '><');
}


PageTurner.prototype.resize = function(){
  this.size = {
    width:this.book.width(),
    height:this.book.height()
  }

  this.leaves.width(this.size.width).height(this.size.height);

/*
  if(this.is3d){
    this.fronts.width(this.size.width).height(this.size.height);
    this.backs.width(this.size.width).height(this.size.height);
    this.book.find('.leaf, .leafholder').width(this.size.width).height(this.size.height);  
  }
*/
  

  this.emit('resize', this.size);
}

/*

  animate the book sequentially either left (-1) or right (1)
  
*/
PageTurner.prototype.animate_direction2 = function(direction, nextpage){
  var self = this;

  if(!self.active){
    return;
  }

  self.active = false;

  if(arguments.length<=1){
    nextpage = this.currentpage + direction;  

    if(nextpage<0 || nextpage>=this.page_html.length){
      self.emit('canceldrag');
      return;
    }
  }

  this.emit('load', nextpage);

  var side = direction<0 ? 'left' : 'right';
  var otherside = (side=='left' ? 'right' : 'left');

  if(!this.is3d){
    self.emit('animate', side, nextpage);
    self.emit('animated', side, nextpage);
    this.load_page(nextpage);
    return;
  }

  var direction = side=='left' ? 1 : -1;

  var edge_target_rotation = side=='left' ? 180 : -180;
  var edge_middle_rotation = side=='left' ? 90 : -90;
  var edge_reset_rotation = side=='left' ? -180 : 180;

  var frontleaf = this[side + 'front'];
  var backleaf = this[side + 'back'];
  var edge = this[side + 'edge'];

  self.processmask(frontleaf, 5);
  self.processmask(backleaf, 5);

  edge.css({
    opacity:0
  })

  setupAnimator(edge, 'after', self.options.animtime/2, function(){
    
    setupAnimator(edge, 'before', self.options.animtime/2, function(){
      
      

    })

    setTimeout(function(){
      edge.css({
        opacity:0
      })
    }, (3*self.options.animtime)/8);

    setRotation(edge, edge_target_rotation);  
    
  });

  setupAnimator(frontleaf, 'after', self.options.animtime/2, function(){

    frontleaf.css({
      opacity:0
    })

    backleaf.css({
      opacity:1
    })

    setupAnimator(backleaf, 'before', self.options.animtime/2, function(){

      self.emit('animated', side, nextpage);
      self.load_page(nextpage);
    })

    setRotation(backleaf, 0);
    
    
  });

  setTimeout(function(){
    edge.css({
      opacity:1
    })
  }, self.options.animtime/8);

  edge.css({
    opacity:1
  })

  self.emit('animate', side, nextpage);

  removeAnimator(backleaf);

  setRotation(frontleaf, direction * 45);
  setRotation(edge, 45);//edge_middle_rotation);
  
}






/*

  animate the book after having shifted the pages around so a non-sequential page is the target
  
*/
PageTurner.prototype.animate_index = function(index){
  var self = this;

  if(!self.active){
    return;
  }

  self.active = false;
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

  if(base){
    base.find('.content').html(basehtml);
  }
  

  var leaf = this[side + 'back'];

  if(leaf){
    leaf.find(' .content').html(basehtml);
  }
  
  setTimeout(function(){
    self.active = true;
    self.animate_direction(direction, index);
  }, 500)
}








PageTurner.prototype.build_edges = function(){

  var self = this;
  if(this.leftedge){
    this.leftedge.remove();
  }

  if(this.rightedge){
    this.rightedge.remove();
  }

  var leftedgeelem = $('<div class="leftedge leafholder maintain3d"><div class="leafedge"></div></div>').css({
    'z-index':1000
  })
  var rightedgeelem = $('<div class="rightedge leafholder maintain3d"><div class="leafedge"></div></div>').css({
    'z-index':1001
  })

  this.leftedge = leftedgeelem;
  this.rightedge = rightedgeelem;

  self.leftedge.css({
    opacity:0
  })

  self.rightedge.css({
    opacity:0
  })

  var edgewidth = this.options.edgewidth || 10;
  var leftrotatededge = this.leftedge.find('.leafedge').css({
    width:edgewidth + 'px',
    left:-(edgewidth/2) + 'px'
  })

  var rightrotatededge = this.rightedge.find('.leafedge').css({
    width:edgewidth + 'px',
    right:-(edgewidth/2) + 'px'
  })

  setRotation(leftrotatededge, 90);
  setRotation(rightrotatededge, 90);

  this.backs.append(this.rightedge);
  this.backs.append(this.leftedge);
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

var easings = {
  'linear':'cubic-bezier(0.250, 0.250, 0.750, 0.750)',
  'easein':'cubic-bezier(0.420, 0.000, 1.000, 1.000)',
  'easeout':'cubic-bezier(0.000, 0.000, 0.580, 1.000)'
}

function setupAnimator(elem, sequence, ms, fn){
  //var easingname = sequence=='before' ? 'easeout' : 'easein';
  var easingname = sequence=='before' ? 'easein' : 'easeout';
  var easing = easings[easingname];

  ['', '-webkit-', '-moz-', '-ms-', '-o-'].forEach(function(prefix){
    elem.css(prefix + 'transition-timing-function', easing);
    elem.css(prefix + 'transition', prefix + 'transform ' + ms + 'ms ' + easing);
  })

  afterTransition.once(elem.get(0), function(){
    fn && fn();
  });
}

function removeAnimator(elem){
  ['', '-webkit-', '-moz-', '-ms-', '-o-'].forEach(function(prefix){
    elem.css(prefix + 'transition-timing-function', '');
    elem.css(prefix + 'transition', '');
  })
}

function setPerspective(elem, amount){
  ['', '-webkit-', '-moz-', '-ms-', '-o-'].forEach(function(prefix){
    elem.css(prefix + 'perspective', amount + 'px');
  })
}