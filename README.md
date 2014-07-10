
# pageturner

A [component](https://github.com/component/component) that turns HTML into a CSS 3d book

## installation

```
$ component install binocarlos/pageturner
```

## example

An example of some HTML book content:

```html
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
<div id="buttons">
  <button id="prev">Prev Page</button>
  <button id="next">Next Page</button>
  <button id="first">First Page</button>
  <button id="last">Last Page</button>
</div>
```

Then triggering the book on that content:

```js
var PageTurner = require('pageturner')
var book = PageTurner()

var bookElem = document.querySelector('#mybook')

book.load(bookElem, '.page')
book.appendTo(bookElem)
book.loadPage(0)

book.on('render:book', function(elem){
    console.log('book rendered')
})

book.on('view:index', function(index){
    console.log('viewing page: ' + index)
})

book.on('render:leaf', function(leafElement, side, index){
    // leafElement is a one half page that is currently viewable  
})

document.querySelector('#prev').addEventListener('click', function(){
    book.turnDirection(-1)
})

document.querySelector('#next').addEventListener('click', function(){
    book.turnDirection(1)
})

document.querySelector('#first').addEventListener('click', function(){
    book.turnToPage(0)
})

document.querySelector('#last').addEventListener('click', function(){
    book.turnToPage(2)
})
```

## api

### `var book = PageTurner(options)`

Create a new book with the following options:

 * startPage (0) - the page to start on
 * renderAhead (3) - the number of pages to render ahead/behind the current page

### `book.load(domElement, pageSelector)`

Load page data from a DOM element - each page html will be slurped from the DOM elements within 'domElement' and matching 'pageSelector'

### `book.load(pageDataArray)`

Load page data from a POJO array - each page object should have a 'html' property.

You can also pass an array of strings where each string is the HTML for the page.

### `book.appendTo(target)`

Get the DOM element for the book.  You can append this to an existing element or pass the target to append the book element onto.

```js
book.appendTo(document.querySelector('#myholder'))

// or

book.appendTo('#myholder')
```

### `book.loadPage(index)`

This will not animate the book but is used to immediately change the page that is viewable

### `book.getPages()`

Return an array of the current page objects

### `book.turnDirection(direction)`

Pass 1 to move forward a page or -1 to move backwards a page.

This will have no effect if the new page is outside boundaries (<0 || >pages.length)

### `book.turnToPage(index, animTime)`

Cycle through pages until you get to the passed index.

You can pass an overridden animTime to make the pages skip faster than usual.

## events

### `book.on('data', function(pages){})`

called when data is loaded either from the DOM or from a passed array.

pages is an array of POJO page descriptions (with a HTML property)

### `book.on('render:book', function(element){})`

the element for the book has been created and is passed

### `book.on('render:leaf', function(element, side, index){})`

A single half of a page (a leaf) has been rendered as a DOM element - the side is 'left' or 'right' and the index is the page number

### `book.on('view:index', function(index, pageCount){})`

The given page number is currently viewable

### `book.on('view:leaf', function(element, side, index){})`

A single half of a page (a leaf) is now visible - the side is 'left' or 'right' and the index is the page number

### `book.on('turn:start', function(currentPage, nextPage, direction){})`

A page turn has started.  The currentPage is the page that was viewable and nextPage is the next index coming into view.

Direction is 1 for a move forward and -1 for a move backwards action.

### `book.on('turn:end', function(currentPage, nextPage, direction){})`

A page turn has ended.  The parameters are the same as for the corresponding turn:start event

## ascii

a single page turn = 2 leafs turning at the same time

One turns till halfway then triggers the other leaf (which is vertical)
to complete it's turn

```
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