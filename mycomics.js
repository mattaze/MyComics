/**
 * console-wars-basic.js
 * version 0.1
 * sound operations
 */

var Binder = {};

/**
 * bind html dom elements with data-bind with provided model.
 * Attempt at a shorthand knockout.js version, with just what this project needs
 * @param {object} data_model data transfer object
 */
Binder.Apply = function(model, root_element) {
    root_element = root_element || document;
    var binds = root_element.querySelectorAll("[data-bind]");
    binds.forEach(function (elm) {
        //elm.dataset[bind] 
        let binder = elm.dataset.bind;
        // JSON.parse
        //binder = JSON.parse("{"+binder+"}");
        binder = Binder.ToObject(binder);
        // iterate for object
        for(let b_prop in binder) {
            // Bindings[prop]
            if(Binder.Types[b_prop]) {
                Binder.Types[b_prop](elm, model, binder[b_prop]);
            }
        }
        
    });
};

Binder.Types = {};

/**
 * attach click event to element, with optional arguments
 */
Binder.Types.click = function(elm, model, args) {
    if(typeof args === 'string') {
        var func = model[args] || mycomics[args];
        if(func) {
            elm.addEventListener("click", model[args]);
        }
    }
};
Binder.Types.dblclick  = function(elm, model, args) {
    Binder.Types.event(elm, model, args, "dblclick");
};
Binder.Types.event = function(elm, model, args, event_type) {
    //temp fix untill multiple args can be bound
    if(model.issueid) {
        elm.addEventListener(event_type, mycomics.edit);
    }
    
    if(typeof args === 'string' || typeof model[args] === 'number') {
        elm.addEventListener(event_type, model[args]);
    }
    
    
};

/**
 * apply model text to element
 */
Binder.Types.text = function(elm, model, args) {
    if(typeof model[args] === 'string' || typeof model[args] === 'number') {
        elm.innerHTML = "";
        elm.appendChild($.textNode(model[args]));
    }
    else {
        elm.innerHTML = "";
        elm.appendChild($.textNode("no " + args));
    }
    elm.dataset.contentBind = args;
};
/**
 * apply model text to element
 */
Binder.Types.textprop = function(elm, model, args) {
    if(typeof model[args] === 'string' || typeof model[args] === 'number') {
        elm.innerHTML = "";
        elm.appendChild($.textNode(args));
    }
    elm.dataset.contentBind = args;
};

Binder.Types.src = function(elm, model, args) {
    elm.src = model[args];
};
Binder.Types.attr = function(elm, model, args) {
    //attr: {src: image}
    //args >> "{src"
    //elm.setAttribute(args, model[args]);
    elm.setAttribute(args, model.TempID);
};
Binder.Types.array = function (elm, model, args) {
    elm.innerHTML = "";
    if(model["Show" + args]) {
        model["Show" + args](elm, model, args);
    }
    
    //temp fix
    if(args == "issues") {
        mycomics.ShowIssues(elm, model, args);
    }
};

Binder.CloneTemplates = [];

Binder.func = {};
Binder.func.GetTemplate = function (elm) {
//check if CloneTemplates
    let clone_id = elm.dataset.BinderCloneTemplateID;
    //not bound?
    if(!clone_id) {
        let document_frag = document.createDocumentFragment();
        let children = elm.children;
        for(var c_i = 0; c_i < children.length; c_i++) {
            document_frag.appendChild(children[c_i]);
        }
        clone_id = Binder.CloneTemplates.push(document_frag) -1;
        elm.dataset.BinderCloneTemplateID = clone_id;
    }
    return Binder.CloneTemplates[clone_id];
};

Binder.Types.foreach = function (elm, model, args) {
    let template = Binder.func.GetTemplate(elm);
    //elm = lib.empty(elm);
    elm.innerHTML = "";

    if(!model[args]) {
        return;
    }

    //get CloneTemplates
    let model_arr = model[args];
    let row_item = null;
    for(var a_i = 0; a_i < model_arr.length; a_i++) {
        let row_elm = template.cloneNode(true);
        let row_item = model_arr[a_i];
        Binder.Apply(row_item, row_elm);
        //row_elm.dataset.id = row_item.TempID;
        elm.appendChild(row_elm);
    }
};

Binder.ToObject = function (binder) {
    var binder_obj = {};
    //"click: action"
    var parts = binder.split(",");
    var pointer_p = parts.length;
    while(pointer_p--) {
        var part = parts[pointer_p];
        var sub_parts = part.split(":");
        binder_obj[sub_parts[0].trim()] = sub_parts[1].trim();
    }
    return binder_obj;
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
    self.Catalog = [
        { title: "empty" }
    ];
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
    
    self.Load = function() {
        var ls_data = localStorage.getItem(self.storageKey);
        if(ls_data) {
            self.Catalog = JSON.parse(ls_data);
            
        }
        //display error - or get from server
        self.ApplyTempID();
        self.ShowTitles();
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
    
    self.Save = function() {
        localStorage.setItem(self.storageKey, JSON.stringify(self.Catalog));
    };
    
    self.Export = function() {
        lib.jsonSave(JSON.stringify(self.Catalog, null, 2), "mycomics_" + lib.dateStr() + ".json", "text/plain");
    };
    
    //$.bind("add-series", self.AddSeries);

    return self;
}).apply(mycomics = {});
Binder.Apply(mycomics);

mycomics.Load();
 


