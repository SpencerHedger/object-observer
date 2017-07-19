/*
 ObjObserver by Spencer Hedger (https://github.com/SpencerHedger/object-observer).
 
 Call ObjObserver.observable() passing in an underlying data object to observe.
 A Proxy to the object is created and returned which reflects the underlying object and
 is responsible for notifying observers when changes are made and synchronising these
 changes to the underlying data object.
 
 Add observers to the object through an 'observe' property on the returned Proxy. To
 observe changes to a specific property of the object, use 'observe.propertyName' where
 propertyName is a property of the observed object.
 
 An observers can be notified either before, after or on cancel of a change made through
 the proxy. They take the form of either:
 	A function, with three parameters (which is called before update):
		value			The value that is about to be assigned
		
		data			The data object containing the property
		
		propertyName	The name of the property in the target object
 
      Using these parameters, you can establish what the value currently is
      (e.g. data[propertyName]) and what it is about to become (e.g. value).

 	... or ...
 	
 	An object with any of the following functions defined:
 		onBind		Called once when the observer is bound to the proxy
 					Expects a function with parameters of value, data and propertyName
 					
		before		Called each time before a value is updated
					Expects a function with parameters of value, data and propertyName
					Return false from this function to prevent an update to the object
					
		after		Called each time after a value is updated
					Function with parameters of value, data and propertyName 
					
		cancel		Called each time when the update of a value is attempted but cancelled by
					one of the "before" observers.
					Function with parameters of value, data and propertyName
					
					
 You can use this information to drive interface updates or validate changes. For example
 if you create an element where the innerHTML is updated by an observer function, when
 you change the value of the observed property through the proxy the element will
 automatically update to reflect the changes.
 
 To perform validation, you can prevent a change from reaching the underlying
 data object by returning 'false' from any of the "before" observer functions.
 
 Note that if validation is performed, any observers which update view state should
 probably use "after" observer functions so they do not become out of step with the
 underlying data.
 
 An "options" object can be specified as a second parameter to the observable() function:
 	nameOfObserveProperty		Default name is 'observe' for assigning observers on
 								the Proxy. If this clashes with any property in your data,
 								you can specifying an alternative here.
 
 You can add more than one observer to any given object or property.
*/
var ObjObserver = function() {
	function observable(d, options) {
		var _options = options || { };
		_options.nameOfObserveProperty = _options.nameOfObserveProperty || 'observe';
		
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
					
					if(typeof(value) === 'function') _l[prop].push( { before: value } );
					else {
						_l[prop].push(value);
						if(value.onBind) value.onBind(d[prop], d, prop);
					}
				}
			});
		
		var _o = {
		};
		
		return new Proxy(d,
		{
			get: function(obj, prop) {
				if(prop === _options.nameOfObserveProperty) {
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
				if(prop === _options.nameOfObserveProperty) {
					if(value == null) _l.length = 0; // Clear all listeners with a null value
					else if(typeof(value) === 'function') _l._fireOnAllChanges.push(value);
					
					return true; // success
				}
				else {
					var ok = true; // Can be set to false by "before" listeners
					
					// Loop over specific property listeners (any listener returning false prevents value change)
					if(_l[prop]) {
						for(var i = 0; i < _l[prop].length; i++) {
							if(_l[prop][i].before) {
								if(_l[prop][i].before(value, obj, prop) === false) ok = false;
							}
						}
					};

					// Loop over broader object-wide listeners (any listener returning false prevents value change)
					for(var i = 0; i < _l._fireOnAllChanges.length; i++) {
						if(_l._fireOnAllChanges[i].before) {
							if(_l._fireOnAllChanges[i].before(value, obj, prop) === false) ok = false;
						}
					};
					
					// Do the assignment
					if(ok) {
						if(typeof value === 'object' || Array.isArray(value)) obj[prop] = observable(value, obsProp);
						else obj[prop] = value;
					
						// Loop over specific property listeners
						if(_l[prop]) { for(var i = 0; i < _l[prop].length; i++) if(_l[prop][i].after) _l[prop][i].after(value, obj, prop); };
						for(var i = 0; i < _l._fireOnAllChanges.length; i++) if(_l._fireOnAllChanges[i].after) _l._fireOnAllChanges[i].after(value, obj, prop);
					
						return true; // success
					}
					else {					
						if(_l[prop]) { for(var i = 0; i < _l[prop].length; i++) if(_l[prop][i].cancel) _l[prop][i].cancel(value, obj, prop); };
						for(var i = 0; i < _l._fireOnAllChanges.length; i++) if(_l._fireOnAllChanges[i].cancel) _l._fireOnAllChanges[i].cancel(value, obj, prop);
						
						return false;
					}
				}				
			}
		});
	}
	
	return {
		observable: observable
	};
}();
