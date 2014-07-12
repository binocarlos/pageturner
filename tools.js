var ua = navigator.userAgent.toLowerCase()
var ie = ua.indexOf('msie') != -1 ? parseInt(ua.split('msie')[1]) : false
var has3d = require('has-translate3d')
var css = require('css')
var prefixed = require('prefixed')
var transform = require('transform-property')
var afterTransition = require('after-transition')

if(ua.indexOf('.net')>=0){
  ie = true
}

function is3d(){
  return has3d && !ie
}

function setLeafTransform(elem){
  
  var rotation = elem._rot || 0
  var z = elem._z || 0

  if (transform && is3d()) {
    if (has3d) {
      var props = []

      if(rotation!=0){
        props.push('rotateY(' + rotation + 'deg)')
      }

      if(z!=0){
        props.push('translateZ(' + z + 'px)')
      }

      var propsst = props.join(' ')
      elem.style[transform] = propsst
    }
  }
}

function setZ(elem, amount, noWrite){
  elem._z = amount;
  if(!noWrite){
    setLeafTransform(elem);  
  }
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
  var easingname = sequence=='before' ? 'easein' : 'easeout';
  var easing = easings[easingname];

  ['', '-webkit-', '-moz-', '-ms-', '-o-'].forEach(function(prefix){
    css(elem, prefix + 'transition-timing-function', easing);
    css(elem, prefix + 'transition', prefix + 'transform ' + ms + 'ms ' + easing);
  })

  afterTransition.once(elem, function(){
    fn && fn();
  });
}

function removeAnimator(elem){
  prefixed(elem.style, 'transition-timing-function', '')
  prefixed(elem.style, 'transition', '')
}

function setPerspective(elem, amount){
  prefixed(elem.style, 'perspective', amount + 'px')
}

function directionToSide(direction){
  return direction<0 ? 'left' : 'right'
}

function otherSide(side){
  return side=='left' ? 'right' : 'left'
}

module.exports = {
  is3d:is3d,
  setupAnimator:setupAnimator,
  removeAnimator:removeAnimator,
  setPerspective:setPerspective,
  setZ:setZ,
  setRotation:setRotation,
  directionToSide:directionToSide,
  otherSide:otherSide
}
