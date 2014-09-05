var tools = require('./tools')
var css = require('css')

module.exports = animator

function animator(options){

  options = options || {}

  return function(side, getLeaves, quickMode, done){

    if(!done){
      done = quickMode
      quickMode = false
    }

    if(typeof quickMode =='boolean'){
      quickMode = quickMode ? 300 : 0
    }

    var otherside = tools.otherSide(side)

    var frontRotation = 0;
    var pageDirection = 0;

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
      frontRotation = 179
      backRotation = -1

    }
    else{
      
      hideleaf = thisLeaves.left;
      frontleaf = thisLeaves.right;
      backleaf = nextLeaves.left;
      nextleaf = nextLeaves.right;

      pageDirection = 1;
      frontRotation = -179
      backRotation = 1
    }

    frontleaf.parentNode.appendChild(frontleaf)
    backleaf.parentNode.appendChild(backleaf)

    function runAnimation(){

      var finishCount = 0

      function doFinish(){
        tools.removeAnimator(frontleaf)
        tools.removeAnimator(backleaf)
        done()
      }

      function tryFinish(){
        finishCount++
        if(finishCount==2){
          doFinish()
        }
      }

      var animTime = quickMode ? 200 : (options.animtime || 500)

      tools.setupAnimator(frontleaf, 'before', animTime, tryFinish)
      tools.setupAnimator(backleaf, 'before', animTime, tryFinish)

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