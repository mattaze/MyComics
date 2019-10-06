/**
 * lib.js
 * version 0.1
 * simplified operations
 */

var lib = {};

/**
 * template element cloning
 */
lib.clone = function(id) {
	return document.getElementById(id).content.cloneNode(true);
};

lib.empty = function(elm) {
	var clone_node = elm.cloneNode(false);
    elm.parentNode.replaceChild(clone_node, elm);
    return clone_node;
};
lib.objectToHTML = function(js_object, element) {
    var sub_element;
    var set_value;
    for(const prop in js_object) {
        sub_element = element.querySelector("." + prop);
        if(sub_element) {
            if(sub_element.nodeName == "INPUT") {
                if(sub_element.type == "checkbox") {
                    sub_element.checked = js_object[prop] ? true : false;
                }
                else if(sub_element.type == "text") {
                    sub_element.value = js_object[prop];
                }
            }
            else {
                set_value = js_object[prop];
                if(sub_element.dataset.format) {
                    set_value = sub_element.dataset.format.replace("$", set_value);
                }
                sub_element.textContent = set_value;
            }
        }
    }
};

// lib.dom = {};
// lib.dom.set = function()

/**
 * get object by string
 * @param {Object} o object for attribute
 * @param {String} s dot notation to attribute
 */
lib.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
};

lib.jsonSave = function(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
};

lib.jsonFileReadEvent = function(evt, callback) {
    var reader = new FileReader();
    reader.onload = function (load_event) {
        var obj = JSON.parse(load_event.target.result);
        if(callback) {
            callback(obj);
        }
    };
    reader.readAsText(evt.target.files[0]);
};

lib.dateStr = function(date, spacer) {
    var d = date || new Date();
    spacer = spacer || "-";
    return d.getFullYear() + spacer + lib.pad(d.getMonth() + 1, 2) + spacer + lib.pad(d.getDate(), 2);
};
lib.timestamp = function() {
    return new Date().toISOString();
};

lib.pad = function(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};

/**
 * sub library of javascript functions. to avoid overlapping names for Element functions
 */
lib.js = {};

/**
 * copy an object
 */
lib.js.copy = function(obj) {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * REPLACED with Object.keys(obj)
 */
lib.js.propertiesCount = function(obj) {
    return Object.keys(obj);
    // var count = 0;
    // for(let attribute in obj) {
    //     count++;
    // }
    // return count;
};

/**
 * get random item in array (or property of object) (because adding to Array.prototype apparently not a good thing to do?)
 * @param {Object} object or array
 */
lib.js.random = function (from_object) {
    if(Array.isArray(from_object)){
        return from_object[Math.floor(Math.random() * from_object.length)];
    }
    else {
        //object - get random property
        let keys = Object.keys(from_object);
        return from_object[keys[Math.floor(Math.random() * keys.length)]];
    }
};


lib.rand = function(max, min = 0) {
    return Math.floor(Math.random() * max) + min;
};

/**
 * concept function?
 * text = bracket attribute naming
 */
lib.replace = function(text, obj) {
    //https://stackoverflow.com/questions/1493027/javascript-return-string-between-square-brackets
    
    let matches = text.match(/\[(.*?)\]/);

    if (matches) {
        let match = matches[1];
    }
    
    return text.replace("[name]", obj.name);
};

lib.func = {};
lib.func.rp = function(str, obj) {
    let new_str = str.replace("","");
    for(let attr in obj) {
        new_str = new_str.replace(attr, obj[attr]);
    }
    return new_str;
};

lib.searchInfo = {
    instanceTime: "",
    running: false,
    instanceID: "xx1d" 
};

/**
 * 
 */
lib.search = function(data, search_for, property, callback) {
    if(!lib.searchInfo.worker) {
        lib.searchInfo.worker = new Worker("scripts/search-worker.js");
        lib.searchInfo.worker.onmessage = lib.searchResults;
    }
    var search_parameters = {data: data, search: search_for, property: property, instanceID: lib.searchInfo.instanceID};
    lib.searchInfo.callback = callback;
    
    lib.searchInfo.running = true;
    //lib.searchState.style.display = "";
    lib.searchInfo.instanceTime = Date.now();
    lib.searchInfo.worker.postMessage(search_parameters);
};
lib.searchResults = function(evt) {
    console.log("lib.search time: " + (Date.now() - lib.searchInfo.instanceTime) + " ms");
    
    var results = evt.data;
    
    //MyLibraryJS.Show(results);
    
    lib.searchInfo.running = false;
    //lib.searchState.style.display = "none";
    
    lib.searchInfo.callback(results);
};

lib.clearClass = function(parent_node, class_name) {
    var elms = parent_node.querySelectorAll("." + class_name);

    [].forEach.call(elms, function(elm) {
        elm.classList.remove(class_name);
    });
};

lib.selectElementContents = function(elm) {
    var range = document.createRange();
    range.selectNodeContents(elm);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
};

var $ = {};
(function() {
    this.d = document;
    this.textNode = document.createTextNode.bind(document);
    
    /**
     * @param {string} id element
     * @param {function} func function
     */
    this.bind = function (id, func) {
        document.getElementById(id).addEventListener(func);
    };
    
    return this;
}).apply($ = {});