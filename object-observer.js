/*
 ObjObserver by Spencer Hedger (https://github.com/SpencerHedger/object-observer).
 
 Call ObjObserver.observable() passing in an underlying data object to observe.
 A Proxy to the object is created and returned which reflects the underlying object and
 is responsible for notifying observers when changes are made and synchronising these
 changes to the underlying data object.
 
 Add observers to the object through an 'observe' property on the returned Proxy. To
 observe changes to a specific property of the object, use 'observe.propertyName' where
 propertyName is a property of the observed object.
 
 An observer is a function, with three parameters:
 	value			The value that is about to be assigned
 	data			The data object containing the property
 	propertyName	The name of the property in the target object
 	
 Using these parameters, you can establish what the value currently is (e.g. data[propertyName])
 and what it is about to become (e.g. value).
 
 You can use this information to drive interface updates or validate changes. For example
 if you create an element where the innerHTML is updated by an observer function, when
 you change the value of the observed property through the proxy the element will
 automatically update to reflect the changes.
 
 If the default name 'observe' on the Proxy clashes with any property in your data,
 you can rename this by specifying an alternative as the second parameter to the
 observable() function.
 
 You can add more than one observer to any given object or property.
*/
var ObjObserver = function() {
	function observable(d, obsProp) {
		var _listenprop = obsProp || 'observe'; // Allow default listener variable name to be changed
		
		var _l = {
			_fireOnAllChanges: []
		};
		
		var _listeners = new Proxy(_l,
			{
				get: function(obj, prop) {
					if(!_l[prop]) _l[prop] = new Array();
					return _l[prop];
				},
				set: function(obj, prop, value) {
					if(!_l[prop]) _l[prop] = new Array();
					if(typeof(value) === 'function') _l[prop].push(value);
				}
			});
		
		var _o = {
		};
		
		return new Proxy(d,
		{
			get: function(obj, prop) {
				if(prop === _listenprop) {
					return _listeners;
				}
				else {
					// Does this object need to be converted into a proxy?
					if(typeof obj[prop] === 'object' && obj[obsProp] == undefined) {
						if(_o[prop] == undefined) _o[prop] = observable(obj[prop], obsProp);
						return _o[prop];
					}
					else return obj[prop]; // Simply value
				}
			},
			set: function(obj, prop, value) {
				if(prop === _listenprop) {
					if(value == null) _l.length = 0; // Clear all listeners with a null value
					else if(typeof(value) === 'function') _l._fireOnAllChanges.push(value);
					
					return true; // success
				}
				else {
					// Loop over specific property listeners (any listener returning false prevents value change)
					if(_l[prop]) {
						for(var i = 0; i < _l[prop].length; i++) {
							if(_l[prop][i](value, obj, prop) === false) return false;
						}
					};

					// Loop over broader object-wide listeners (any listener returning false prevents value change)
					for(var i = 0; i < _l._fireOnAllChanges.length; i++) {
						if(_l._fireOnAllChanges[i](value, obj, prop) === false) return false;
					};
					
					// Do the assignment
					if(typeof value === 'object' || Array.isArray(value)) obj[prop] = observable(value, obsProp);
					else obj[prop] = value;

					return true; // success
				}				
			}
		});
	}
	
	return {
		observable: observable
	}
}();