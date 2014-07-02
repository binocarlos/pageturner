var tools = require('./tools')

function animator(book){

  return function(direction, done){

    var side = tools.directionToSide(direction)
    var otherside = tools.otherSide(side)
    var nextpage = this.book.nextPage(direction)

    if(nextpage<0){
      return
    }

    var frontRotation = 0;
    var pageDirection = 0;

    var thisPage = book.getLeaves()
    var lastPage = book.getLeaves(-1)
    var nextPage = book.getLeaves(1)
   
    var frontleaf, backleaf, nextleaf, hideleaf;

    if(side=='left'){

      pageDirection = -1;
      frontRotation = 180;

      hideleaf = this.pages[this.currentpage].right;
      frontleaf = this.pages[this.currentpage].left;
      backleaf = this.pages[this.currentpage - 1].right;
      nextleaf = this.pages[this.currentpage - 1].left;
    }
    else{
      
      pageDirection = 1;
      frontRotation = -180;

      hideleaf = this.pages[this.currentpage].left;
      frontleaf = this.pages[this.currentpage].right;
      backleaf = this.pages[this.currentpage + 1].left;
      nextleaf = this.pages[this.currentpage + 1].right;
    }

    setupAnimator(frontleaf, 'before', self.options.animtime, function(){
    
    });

    setupAnimator(backleaf, 'before', self.options.animtime, function(){

      self.runningpage = null;
      setZ(hideleaf, 0);
      self.load_page(self.currentpage + pageDirection);
      self.finish_animation(done);
      
    });

    setZ(hideleaf, -1);

    backleaf.css({
      opacity:1,
      'z-index':1000
    })

    frontleaf.css({
      opacity:1,
      'z-index':1000
    })

    nextleaf.css({
      opacity:1
    })

    setRotation(frontleaf, frontRotation);
    setRotation(backleaf, 0);
  }
}