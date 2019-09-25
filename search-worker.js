var lib = {};
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

var instances = {};

/**
 * done:
 * ObjectArraySearch
 * 
 * 
 * want:
 * property search with nested  Prop1.Prop2 = {Prop1: {Prop2:"dd"}}
 * search break/replace/cancel
 * 
 */

/**
 * evt.data = {data: {}, search :"", property: "optional.sub"}
 */
onmessage = function(evt) {
    var timestamp = Date.now();
    if(evt.data.instanceID) {
        instances[evt.data.instanceID] = timestamp;
    };
    var instanceID = {id: evt.data.instanceID, time: timestamp};

    var search_for = evt.data.search;
    var search_object = evt.data.data;
    var results;
    
    if(Array.isArray(search_object)) {
        results = ArraySearch(search_object, search_for, evt.data.property);
    }
    else {
        results = ObjectArraySearch(search_object, search_for, evt.data.property, instanceID);
    }

    if(results) {
        postMessage(results);
    }
};

/**
 * 
 * @param {*} object_array 
 * @param {*} search_for 
 * @param {*} property  "Name" search_for X-Men vol
 */
function ObjectArraySearch(object_array, search_for, property, instanceID) {
    var this_object;
    var check_value;
    /* var sub_properties = property.split('.');
    var sub_search = sub_properties.length > 1; */
    //var results = [];
    var results = {};
    for(var prop in object_array) {
        //cancel running search which has a new search running
        if(instances[instanceID.id] != instanceID.time) {
            return;
        }

        check_value = prop;
        if(search_for.Series) {
            if(check_value.indexOf(search_for.Series) !== -1) {
                //results.push(object_array[prop]);
                results[prop] = object_array[prop];
            }
        }
        else {
            results[prop] = object_array[prop];
        }
        if(results[prop] && (search_for.IssueID || search_for.Depth)) {
            //continue search
            results[prop].Issues = ArraySearch(results[prop].Issues, search_for.IssueID, "IssueID");
        }

        /* if(sub_search) {
            //this object - clear Issues, then add results
            this_object = object_array[prop];
            this_object.Issues = ArraySearch(this_object.Issues, search_for, sub_properties[1]);
            results[prop] = this_object;
        }
        else {
            if(property) {
                check_value = object_array[prop][property];
            }
            //this_object = object_array[prop];
            if(check_value.indexOf(search_for) !== -1) {
                //results.push(object_array[prop]);
                results[prop] = object_array[prop];
            }
        } */
    }
    return results;
}

function ArraySearch(array, search_for, property) {
    return array.filter(item => {
        if(typeof(item[property]) == 'string') {
            return item[property].toLowerCase().indexOf(search_for) !== -1;
        }
        else {
            return item[property] == search_for;
        }
    });
}