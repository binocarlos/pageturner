var tools = require('./tools')

function animator(book){
  return function(direction, done){
    var self = this;
    var side = direction<0 ? 'left' : 'right';
    var otherside = (side=='left' ? 'right' : 'left');

    var nextpage = this.currentpage + direction;

    if(nextpage<0){
      return;
    }
    if(nextpage>this.page_html.length-1){
      return;
    }

    if(!this.is3d){
      
      this.load_page(nextpage);
      
      return;
    }

    var frontRotation = 0;
    var pageDirection = 0;
   
    var frontleaf, backleaf, nextleaf, hideleaf;

    if(side=='left'){
      if(self.currentpage - 1<0){
        return false;
      }
      
      pageDirection = -1;
      frontRotation = 180;

      this.runningpage = this.currentpage-1;
      hideleaf = this.pages[this.currentpage].right;
      frontleaf = this.pages[this.currentpage].left;
      backleaf = this.pages[this.currentpage - 1].right;
      nextleaf = this.pages[this.currentpage - 1].left;
    }
    else{
      if(self.currentpage + 1>self.page_html.length-1){
        return;
      }
      
      pageDirection = 1;
      frontRotation = -180;

      this.runningpage = this.currentpage+1;
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