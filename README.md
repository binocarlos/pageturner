
# pageturner

  A jQuery/hammer.js widget that turns HTML into a CSS 3d book

## installation

  Install with [component(1)](http://component.io):

    $ component install binocarlos/pageturner

## example

An example of some HTML book content and using hammer.js for touch events to turn the page

```html
<script src"build/build.js"></script>
<div id="mybook">
	<div class="page">
		page1
	</div>
	<div class="page">
		page2
	</div>
	<div class="page">
		page3
	</div>
</div>
```

```js

var $ = require('jquery');
var Hammer = require('hammer');

$(function(){

  document.ontouchmove = function(event){
      event.preventDefault();
  }

  var PageTurner = require('pageturner');
  var book = new PageTurner({
    bookselector:'#book',
    pageselector:'.page',
    apply_pageclass:'bookpage',
    startpage:5
    
  });

  book.render();

  var hammertime = new Hammer($('body').get(0), {
    drag_min_distance:10,
    tap_max_distance:9
  })

  var dragging = true;
  var animating = false;
  var loading = false;

  book.on('load', function(index){
    loading = true;
  })

  book.on('loaded', function(index){
    loading = false;
  })

  book.on('animate', function(side){
    animating = true;
  })

  book.on('animated', function(side){
    animating = false;
  })

  hammertime.ondragstart = function(ev){
    if(dragging || animating || loading){
      return;
    }
    dragging = true;
  }

  hammertime.ondrag = function(ev){
    if(!dragging || animating || loading){
      return;
    }
    if(ev.distance>=100){
      dragging = false;
      book.animate_direction(ev.direction=='left' ? 1 : -1);  
    }
  }

  hammertime.ondragend = function(ev){
    if(animating || loading){
      return;
    }
    dragging = false;
  }

/*
  hammertime.onswipe = function(ev){
    console.log('-------------------------------------------');
    console.log('swipe');
    book.animate_direction(ev.direction=='left' ? 1 : -1);

  };
*/  

})

```

## License

MIT