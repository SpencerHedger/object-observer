# object-observer
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
