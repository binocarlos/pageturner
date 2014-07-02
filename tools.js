var ua = navigator.userAgent.toLowerCase()
var ie = ua.indexOf('msie') != -1 ? parseInt(ua.split('msie')[1]) : false
var has3d = require('has-translate3d')
var prefixed = require('prefixed')

if(ua.indexOf('.net')>=0){
  ie = true
}

module.exports = {
	is3d:function(){
		return has3d && !ie
	},
	setPerspective:function(elem, amount){
		prefixed(elem.style, 'perspective', amount + 'px')
	}
}