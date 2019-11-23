/**
 * console-wars-basic.js
 * version 0.1
 * sound operations
 */


var myClasses = {
    selected: "selected"
};
 


var volume = {};
(function() {
    let self = this;
    
    self.load = function(issues) {
        var base_elm = document.getElementById("all-issues");
        Binder.Types.foreach(base_elm, {issues}, "issues");
    };
    
    self.issueElm = function(issue) {
        
    };
    self.backgroundImage = function(elm, issue) {
        var panel_width
        
        var img_url = issue.image.original_url;
        //https://comicvine.gamespot.com/api/image/original/5369314-the%20uncanny%20x-men%20%23249%20-%20page%201.jpg
        let parts = img_url.split("/");
        img_url = parts[parts.length - 1];
        img_url = img_url.replaceAll("%", "_x_").replaceAll("\\+", "_x1_");
        
        elm.style.backgroundImage = `url('bin/comicvine/medium-original-${img_url}')`;
        //style="background-image: url('bin/comicvine/medium-original-19599-3092-21875-1-uncanny-x-men-the.jpg');"
        
        panelDimensions = self.issuePanelWidth(elm);
        if(!panelDimensions) {
            panelDimensions = {Width: 20, Cols: 20};
        }
        
        elm.style.width = `calc(100% / ${panelDimensions.Cols})`;
        elm.style.height = `calc(100% / ${panelDimensions.Rows})`;
    };
    
    self.PanelDimensions = {
        ParentWidth: 0
    };
    
    self.issuePanelWidth = function(elm) {
        let base = elm.parentElement || elm.xParent;
        if(!base) {
            return;
        }
        if(self.PanelDimensions.ParentWidth != base.offsetWidth) {
            //use PanelDimensions
            self.PanelDimensions = self.calcPanelWidth(base.offsetWidth, base.offsetHeight, 405, 1.5);
        }
        return self.PanelDimensions;
    };
    
    self.calcPanelWidth = function(wd, hg, count, ratio) {
        if(wd == 0 || hg == 0 || count == 0) {
            return;
        }
        
        var lower = 1;
        var upper = count;
        
        let cols = Math.ceil(upper / 2);
        let x_width = 0;
        let x_height = 0;
        let rows = 0;
        let fits = (cols * rows) < count;
        
        let passes = 0;
        
        while((lower + 1) < upper && passes < count) {
            passes++;
            
            cols =  Math.ceil((lower + upper) / 2);
            x_width = wd / cols;
            x_height = x_width * ratio;
            rows = Math.ceil(hg / x_height);
            fits = (cols * rows) > count;
            
            if(fits) {
                //mid between lower and current
                upper = cols;
            }
            else {
                //mid between current and upper
                lower = cols;
            }
        }
        
        return {
            ParentWidth: wd,
            ParentHeight: hg,
            Width: x_width,
            Height: x_height,
            Cols: cols,
            Rows: rows
        };
    };
    
    return self;
}).apply(volume = {});
//Binder.Apply(volume);

volume.load(uncanny_x_men);