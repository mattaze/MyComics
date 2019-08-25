/**
 * console-wars-basic.js
 * version 0.1
 * sound operations
 */



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
        let series = self.Catalog[event.target.dataset[self.listKey]];
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
        let series = self.SelectedSeries.issues[event.target.dataset[self.listKey]];
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
        //
        issue_view = lib.clone("issue-detail-li");
        Binder.Apply(issue, issue_view);
        //target.insertAdjacentElement("afterend", issue_view);
        target.parentNode.insertBefore(issue_view, target.nextSibling);
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
    
    self.ShowTitles = function() {
        self.LoadUL({
            data: self.Catalog,
            id: "titles",
            prop_id: "TempID",
            content: "title"
        });
    };
    self.LoadUL = function({ data, id, prop_id = "TempID", ul_elm , content}) {
        let ul = ul_elm || document.getElementById(id);
        
        //lib.empty will remove events on the root as well.
        //ul = lib.empty(ul);
        ul.innerHTML = ""; 
        
        data.forEach(function (row) {
            var li = document.createElement("li");
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
    
    /**
     * TempID is a means to keep a master array, and then allow access via position on UL select
     */
    self.ApplyTempID = function() {
        let series_i = self.Catalog.length;
        while(series_i--) {
            self.Catalog[series_i].TempID = series_i;
        }
    };
    
    self.Load = function() {
        var ls_data = localStorage.getItem(self.storageKey);
        if(ls_data) {
            self.FullCatalog = JSON.parse(ls_data);
            self.Catalog = self.FullCatalog.Catalog;
        }
        //display error - or get from server
        self.ApplyTempID();
        self.ShowTitles();
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
 


