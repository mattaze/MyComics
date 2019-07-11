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
        elm.addEventListener("click", model[args]);
    }
};
Binder.Types.dblclick  = function(elm, model, args) {
    Binder.Types.event(elm, model, args, "dblclick");
};
Binder.Types.event = function(elm, model, args, event_type) {
    if(typeof args === 'string') {
        elm.addEventListener(event_type, model[args]);
    }
};

/**
 * apply model text to element
 */
Binder.Types.text = function(elm, model, args) {
    if(typeof model[args] === 'string') {
        elm.innerHTML = "";
        elm.appendChild($.textNode(model[args]));
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
    self.Catalog = [
        { title: "empty" }
    ];
    
    self.backgroundMusic = function(url) {
    };
    
    
    self.SelectSeries = function(event) {
        let series = self.Catalog[event.target.dataset.id];
        if(series) {
            self.ShowSeries(series);
        }
    };
    
    self.ShowSeries = function(series) {
        Binder.Apply(series, document.getElementById("selected-series"));
    };
    self.edit = function(evt) {
        let input = document.createElement("input");
        input.type= "text";
        input.value = evt.target.textContent;
        evt.target.innerHTML = "";
        evt.target.appendChild(input);
        input.focus();
    };
    
    self.ShowTitles = function() {
        self.LoadUL({
            data: self.Catalog,
            id: "titles",
            prop_id: "TempID"
        });
    };
    self.LoadUL = function({ data, id, prop_id = "TempID" }) {
        
        var ul = document.getElementById(id);
        
        //lib.empty will remove events on the root as well.
        //ul = lib.empty(ul);
        ul.innerHTML = ""; 
        
        data.forEach(function (row) {
            var li = document.createElement("li");
            li.appendChild($.textNode(row.title));
            li.dataset.id = row[prop_id];
            ul.appendChild(li);
        });
    };
    
    self.NewSeries = function() {
        let new_series = { title: "new"};
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
 


