var tools = require('./tools')
var css = require('css')

function animator(options, book){

  return function(direction, done){

    var side = tools.directionToSide(direction)
    var otherside = tools.otherSide(side)
    var nextpage = this.book.nextPage(direction)

    if(nextpage<0){
      return
    }

    var frontRotation = 0;
    var pageDirection = 0;

    var thisLeaves = book.getLeaves()
    var lastLeaves = book.getLeaves(-1)
    var nextLeaves = book.getLeaves(1)
   
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

    tools.setupAnimator(frontleaf, 'before', options.animtime, function(){
    
    })

    tools.setupAnimator(backleaf, 'before', options.animtime, function(){

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