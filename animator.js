var tools = require('./tools')
var css = require('css')

module.exports = animator

function animator(options){

  options = options || {}

  return function(side, getLeaves, done){

    var otherside = tools.otherSide(side)

    var frontRotation = 0;
    var pageDirection = 0;

    var afterFrontRotation = 0
    var thisLeaves = getLeaves()
    var lastLeaves = getLeaves(-1)
    var nextLeaves = getLeaves(1)
   
    var frontleaf, backleaf, nextleaf, hideleaf;

    if(side=='left'){
      hideleaf = thisLeaves.right
      frontleaf = thisLeaves.left
      backleaf = lastLeaves.right
      nextleaf = lastLeaves.left

      pageDirection = -1;
      frontRotation = afterFrontRotation = 180
      backRotation = 0.1
      afterBackRotation = 0

    }
    else{
      
      hideleaf = thisLeaves.left;
      frontleaf = thisLeaves.right;
      backleaf = nextLeaves.left;
      nextleaf = nextLeaves.right;

      pageDirection = 1;
      frontRotation = -179.9
      backRotation = afterBackRotation = 0
      afterFrontRotation = -180
    }

    frontleaf.parentNode.appendChild(frontleaf)
    backleaf.parentNode.appendChild(backleaf)

    function runAnimation(){

      var finishCount = 0

      function doFinish(){
        tools.removeAnimator(frontleaf)
        tools.removeAnimator(backleaf)
        tools.setRotation(backleaf, afterBackRotation)
        tools.setRotation(frontleaf, afterFrontRotation)
        done()
      }

      function tryFinish(){
        finishCount++
        if(finishCount==2){
          doFinish()
        }
      }

      tools.setupAnimator(frontleaf, 'before', options.animtime || 500, tryFinish)
      tools.setupAnimator(backleaf, 'before', options.animtime || 500, tryFinish)

      //tools.setZ(hideleaf, -1)
      //tools.setZ(nextleaf, -1)
      
      css(backleaf, {
        opacity:1,
        'z-index':1000
      })

      css(frontleaf, {
        opacity:1,
        'z-index':1000
      })

      css(nextleaf, {
        opacity:1
      })

      tools.setRotation(frontleaf, frontRotation)
      tools.setRotation(backleaf, backRotation)
    }

    setTimeout(runAnimation, 10)
  }
}