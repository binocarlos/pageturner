
# pageturner

A [component(1)](http://component.io) that turns HTML into a CSS 3d book

## installation

  Install with [component(1)](http://component.io):

    $ component install binocarlos/pageturner

## example

An example of some HTML book content:

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

Then triggering the book on that content:

```js
    var $ = require('jquery');

    $(function(){
      var PageTurner = require('pageturner');
      var book = new PageTurner({
        bookselector:'#book',
        pageselector:'.page',
        startpage:1,
        has3d:true,
        pageclass:'bookpage'
      });

      book.render();

      $('#prevbutton').on('click', function(){
        book.animate_direction(-1);
      })

      $('#nextbutton').on('click', function(){
        book.animate_direction(1);
      })

      $('#reload').on('click', function(){
        document.location.reload();
      })
    })

```

## License

MIT