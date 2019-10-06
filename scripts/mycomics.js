/**
 * console-wars-basic.js
 * version 0.1
 * sound operations
 */


var myClasses = {
    selected: "selected"
};
 

/**
 * <li>A-Force - vol. 2 - 2016</li>
                <li>A+X</li>
                <li>Age Of X-Man - 2019</li>
                <li>Age Of X-Man: Apocalypse and the X-Tracts - 2019</li>
                <li>Age Of X-Man: Marvelous X-Men - 2019</li>
                <li>Age Of X-Man: NextGen - 2019</li>
                <li>Age Of X-Man: Prisoner X - 2019</li>
                <li>Age Of X-Man: The Amazing Nightcrawler - 2019</li>
                <li>Age Of X-Man: X-Tremists - 2019</li>
 */

var mycomics = {};
(function() {
    let self = this;
    self.storageKey = "mycomics";
    self.listKey = "id";
    self.FullCatalog = {
        Catalog: [
            { title: "empty" }
        ],
        MAZEComics : {Created: new Date().toISOString() }
    };
    self.Catalog = self.FullCatalog.Catalog;
    
    self.SelectedSeries = {};
    
    self.backgroundMusic = function(url) {
    };
    
    /**
     * event function for series ul bind click
     */
    self.SelectSeries = function(event) {
        var selected_class = myClasses.selected;
        let series = self.Catalog[event.target.dataset[self.listKey]];
        
        lib.clearClass(event.target.parentNode, selected_class);
        event.target.classList.add(selected_class);
        if(series) {
            self.ShowSeries(series);
        }
    };
    
    /**
     * Display provided series to html
     */
    self.ShowSeries = function(series) {
        series = series || self.SelectedSeries;
        self.SelectedSeries = series;
        Binder.Apply(series, document.getElementById("selected-series"));
    };
    
    self.ShowIssues = function(elm, model, args) {
        if (!Array.isArray(model[args])) {
            model[args] = [];
        }
        self.ApplyTempID(model[args]);
        self.LoadUL({
            data: model[args],
            ul_elm: elm,
            prop_id: "TempID",
            content: "issueid"
        });
    };
    
    self.NewIssue = function() {
        let model = self.SelectedSeries;
        let new_issue = {issueid: "x", have: "0", coverdate: "", subtitle: "", paid: "", where:"", when:""};
        new_issue.TempID = model.issues.push(new_issue) - 1;
        
        self.ShowSeries();
    };
    self.SelectIssue = function(event) {
        //let series = self.SelectedSeries.issues[event.target.dataset[self.listKey]];
        let series = self.SelectedSeries.issues[event.target.dataset.TempID];
        if(series) {
            self.ShowIssue(event.target, series);
        }
    };
    self.ShowIssue = function(target, issue) {
        //clear existing sensor
        let issue_view = document.querySelector(".issue-view");
        if(issue_view) {
            issue_view.remove();
        }
        
        //issue_view = lib.clone("issue-detail-li");
        issue_view = lib.clone("issue-detail-ul");
        Binder.Apply(issue, issue_view);
        //target.insertAdjacentElement("afterend", issue_view);
        //target.parentNode.insertBefore(issue_view, target.nextSibling);
        target.appendChild(issue_view);
    };
    
    /**
     * binding function for html edit content
     */
    self.edit = function(evt) {
        let elm = evt.target;
        let func = self.editor[elm.nodeName] || self.editor.text;
        func(elm);
    };
    self.editor = {};
    self.editor.text = function(elm) {
        elm.contentEditable = "true";
        elm.focus();
        elm.addEventListener("blur", self.ApplyChange);
        /* let input = document.createElement("input");
        input.type= "text";
        input.value = evt.target.textContent;
        evt.target.innerHTML = "";
        evt.target.appendChild(input);
        input.focus(); */
    };
    self.editor.IMG = function(elm) {
        let input = document.createElement("input");
        input.type= "text";
        input.value = elm.src;
        input.dataset.contentBind = "image";
        let parent = elm.parentNode;
        parent.insertBefore(input, elm);
        input.focus();
        input.addEventListener("blur", self.ApplyChange);
    };
    //https://static.comicvine.com/uploads/scale_small/0/5344/1355017-uxm_v1_001_01.jpg
    //https://comicvine1.cbsistatic.com/uploads/scale_small/8/84205/4134088-xmen141nm92m093.jpg
    
    self.ApplyChange = function(evt) {
        evt.target.removeEventListener("blur", self.ApplyChange);
        evt.target.contentEditable = "false";
        self.SelectedSeries[evt.target.dataset.contentBind] = evt.target.textContent;
    };
    
    self.ShowTitles = function(data) {
        data = data || self.Catalog;
        self.LoadUL({
            data: data,
            id: "titles",
            prop_id: "TempID",
            content: "title",
            classes: "selectable"
        });
        self.ShowSeries(data[0]);
    };
    self.LoadUL = function({ data, id, prop_id = "TempID", ul_elm , content, classes}) {
        let ul = ul_elm || document.getElementById(id);
        
        //lib.empty will remove events on the root as well.
        //ul = lib.empty(ul);
        ul.innerHTML = ""; 
        
        data.forEach(function (row) {
            var li = document.createElement("li");
            li.className = classes || "";
            li.appendChild($.textNode(row[content]));
            li.dataset[self.listKey] = row[prop_id];
            ul.appendChild(li);
        });
    };
    
    self.NewSeries = function() {
        let new_series = { title: "new", issues: []};
        self.Catalog.push(new_series);
        //select or display new
        self.ShowTitles();
        self.ShowSeries(new_series);
    };
    
    self.SearchSeries = function() {
        var search = document.getElementById("search-series-input").value;
        //self.ShowTitles();
        lib.search(self.Catalog, search, "title", self.ShowTitles);
    };
    
    self.SetSeriesImage = function(img_elm, model, args) {
        img_elm.src = "";
        if(model.image) {
            img_elm.src = model.image;
        }
        else if(model.comicvineid) {
            img_elm.src = "images/pending_image3.gif";
            self.ComicVineImage(img_elm, model, args);
        }
    };
    
    self.SetComicVineLink = function(span_elm, model, args) {
        span_elm = lib.empty(span_elm);
        if(model.comicvineid) {
            var a_elm = document.createElement("a");
            a_elm.target = "_blank";
            a_elm.href = `https://comicvine.gamespot.com/api/${model.comicvineid}/`;
            a_elm.appendChild($.textNode("ComicVine"));
            span_elm.appendChild(a_elm);
        }
    };
    
    self.SearchComicVine = function(result_elm, model, args) {
        //http://comicvine.gamespot.com/api/search?api_key=XXXXXXXXXXXX&format=json&resources=volume&
        //query="All-New Doop"&field_list=name,site_detail_url,start_year,count_of_issues,image,description&limit=2
    };
    
    self.ComicVineImage = function(elm, model) {
        if(model.comicvineid) {
            var url = `https://mazeediting-comicvine.azurewebsites.net/api/api?code=${AppSettings.MyComics_ComicVineAPI_Key}&comicvineid=${model.comicvineid}`;
       /*     var url = `http://comicvine.gamespot.com/api/volume/${model.comicvineid}?api_key=${api_key}&format=json&field_list=count_of_issues,date_added,deck,description,image`;
       */
            fetch(url)
                .then(response => response.json())
                .then(function(json){
                    elm.src = json.results.image.small_url;
                    if(!model.image) {
                        model.image = elm.src;
                    }
                });
        }
    };
    
    self.SetIssueHave = function(elm, issue, args) {
        if(issue.have > 0) {
            elm.classList.add("have");
        }
        if(issue.have > 1) {
            elm.classList.add("many");
        }
    };
    
    /**
     * TempID is a means to keep a master array, and then allow access via position on UL select
     */
    self.ApplyTempID = function(array) {
        let series_i = array.length;
        while(series_i--) {
            array[series_i].TempID = series_i;
        }
    };
    
    self.Load = function() {
        var ls_data = localStorage.getItem(self.storageKey);
        if(ls_data) {
            self.LoadCatalog(JSON.parse(ls_data));
        }
        else {
            //display error - or get from server
            //self.ApplyTempID();
            self.ShowTitles();
        }
    };
    
    self.Save = function() {
        //function (data)  - event is sent??
        //data = data || self.FullCatalog;
        let data = self.FullCatalog;
        
        self.SystemAttr(data, "Modified", lib.timestamp());
        localStorage.setItem(self.storageKey, JSON.stringify(data));
    };
    
    self.Export = function() {
        let data = self.FullCatalog;
        
        var export_stamp = lib.timestamp();
        self.SystemAttr(data, "ExportStamp", export_stamp);
        lib.jsonSave(JSON.stringify(data, null, 2), "mycomics_" + export_stamp + ".json", "text/plain");
    };
    
    self.LoadCatalog = function(catalog_obj) {
        if(catalog_obj) {
            self.FullCatalog = catalog_obj;
            self.Catalog = self.FullCatalog.Catalog;
            self.ShowSeries(self.Catalog[0]);
        }
        //display error - or get from server
        self.ApplyTempID(self.Catalog);
        self.ShowTitles();
    };
    
    self.LoadFileEvent = function(evt) {
        lib.jsonFileReadEvent(evt, self.LoadCatalog);
    };
    
    self.SystemAttr = function(object, attr, value) {
        if(!object.MAZEComics) {
            Object.defineProperty(object, "MAZEComics", {
                value: {"Desc": "Comics Library edited by MAZE Editing - MyComics"},
                enumerable: true,
            });
        }
        sys_info = object.MAZEComics;
        if(value) {
            sys_info[attr] = value;
        }
        return sys_info[attr];
    };
    
    //$.bind("add-series", self.AddSeries);

    return self;
}).apply(mycomics = {});
Binder.Apply(mycomics);

mycomics.Load();
 


function find(array, property, search_for) {
    for(var i = 0, len = array.length; i < len; i++) {
        if(array[i][property] == search_for) {
            return array[i];
        }
    }
    return null;
}

function InputIssueFromFlatFile(issues, catalog) {
	var series = "";
	for(var issue_i = 0, len = issues.length; issue_i < len; issue_i++) {
        var issue = issues[issue_i];
        series = issue.series == series.title ? series : find(catalog, "title", issue.series);
        if(series) {
            series.issues = series.issues || [];
        //check if issue exists?
        series.issues.push(issue);
        }
    }
}
