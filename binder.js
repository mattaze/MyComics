var Binder = {};
Binder.Models = [];
Binder.CloneTemplates = [];

Binder.func = {};
Binder.func.SetTemplate = function (elm) {
    let document_frag = document.createDocumentFragment();
    let children = elm.children;
    for(var c_i = 0; c_i < children.length; c_i++) {
        document_frag.appendChild(children[c_i]);
    }
    let clone_id = Binder.CloneTemplates.push(document_frag) -1;
    elm.dataset.BinderCloneTemplateID = clone_id;
    return clone_id;
};

Binder.func.GetTemplate = function (elm) {
    //check if CloneTemplates
    let clone_id = elm.dataset.BinderCloneTemplateID;
    //not bound?
    if(!clone_id) {
        clone_id = Binder.func.SetTemplate(elm);
    }
    return Binder.CloneTemplates[clone_id];
};
Binder.func.GetModel = function (elm) {
    let model_id;
    while(!model_id && elm) {
        model_id = elm.dataset.BinderModelID;
        if(!model_id) {
            elm = elm.parentElement;
        }
    }
    if(!model_id) {
        //error
    }
    return Binder.Models[model_id];
};
Binder.func.SetModel = function(model, elm) {
    let model_id = elm.dataset.BinderModelID
    if(model_id) {
        //update model
        Binder.Models[model_id] = model;
    }
    else {
        model_id = Binder.Models.push(model) -1;
        elm.dataset.BinderModelID = model_id;
    }
};

/**
 * bind html dom elements with data-bind with provided model.
 * Attempt at a shorthand knockout.js version, with just what this project needs
 * @param {object} data_model data transfer object
 */
Binder.Apply = function(model, root_element, events_model) {
    root_element = root_element || document.body;
    
    if(root_element.nodeName != "#document-fragment") {
        Binder.func.SetModel(model, root_element);
    }
    
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
    //returns Binding object
};
//
Binder.Update = function(model, root_element) {
    
};

Binder.editor = {};
Binder.editor.edit = function(evt) {
    let self = Binder;
    
    let elm = evt.target;
    let func = self.editor[elm.nodeName] || self.editor.text;
    func(elm);
};
Binder.editor.text = function(elm) {
    let self = Binder.editor;
    
    elm.contentEditable = "true";
    elm.focus();
    elm.addEventListener("blur", self.applyChange);
};
Binder.editor.applyChange = function applyChange(evt) {
    let elm = evt.target;
    elm.removeEventListener("blur", applyChange);
    elm.contentEditable = "false";
    
    let model = Binder.func.GetModel(elm);
    
    model[elm.dataset.contentBind] = elm.textContent;
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
        return;
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
 * double click to edit model bound, combines text and dblclick and mycomcis edit
 */
Binder.Types.value = function(elm, model, args) {
    Binder.Types.text(elm, model, args);
    Binder.Types.dblclick(elm, Binder.editor, "edit");
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