
# pageturner

  A jQuery/hammer.js widget that turns HTML into a CSS 3d book

## Installation

  Install with [component(1)](http://component.io):

    $ component install binocarlos/storytimepage

## API

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
	var PageTurner = require('pageturner');

	var book = PageTurner('#mybook > .page');

```

## License

  MIT
