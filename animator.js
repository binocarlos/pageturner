var tools = require('./tools')
var css = require('css')

module.exports = animator

function animator(options){

  options = options || {}

  return function(side, getLeaves, done){

    var otherside = tools.otherSide(side)

    var frontRotation = 0;
    var pageDirection = 0;

    var thisLeaves = getLeaves()
    var lastLeaves = getLeaves(-1)
    var nextLeaves = getLeaves(1)
   
    var frontleaf, backleaf, nextleaf, hideleaf;

    if(side=='left'){

      pageDirection = -1;
      frontRotation = 180;

      hideleaf = thisLeaves.right
      frontleaf = thisLeaves.left
      backleaf = lastLeaves.right
      nextleaf = lastLeaves.left

    }
    else{
      
      pageDirection = 1;
      frontRotation = -180;

      hideleaf = thisLeaves.left;
      frontleaf = thisLeaves.right;
      backleaf = nextLeaves.left;
      nextleaf = nextLeaves.right;
    }

    tools.setupAnimator(frontleaf, 'before', options.animtime || 500, function(){
    
    })

    tools.setupAnimator(backleaf, 'before', options.animtime || 500, function(){

      tools.setZ(hideleaf, 0)

      //self.load_page(self.currentpage + pageDirection)
      //self.finish_animation(done)

      done()
      
    });

    tools.setZ(hideleaf, -1)

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
    tools.setRotation(backleaf, 0)
  }
}