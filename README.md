# object-observer
Get notified when the value of a property in an object is changed by assigning a function to a notional "observe" property.

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
