
# pageturner

A [component](https://github.com/component/component) that turns HTML into a CSS 3d book

## installation

```
$ component install binocarlos/pageturner
```

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
var PageTurner = require('pageturner');

var bookElem = document.querySelectorAll('#mybook')[0]

var book = PageTurner(bookElem, '.page', {
  startpage:1
})

// this will replace the content of the book with the animating version
book.render()
```

## ascii help

```
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
```

## License

MIT