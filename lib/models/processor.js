/*
 * phgm-build
 * https://github.com/phonogram-joe/phgm-build
 *
 * Copyright (c) 2012 Joseph C. Savona
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
var _ = require('underscore');

/*
 *	Processor
 *		Class to manipulate files individually.
 *	
 *	options: object literal
 */
var Processor = function(options) {
	this.initialize(options);
}

/*
 *	Processor.inherit()
 *		convenience method to create a subclass.
 *
 *	defaults: object literal of default options to merge with options
 *		when object instantiated.
 */
Processor.inherit(defaults) {
	var subclass = function(options) {
		options = _.extend({}, this.defaults, options);
		this.initialize(options);
	}
	subclass.factory = function(options) {
		return new subclass(options);
	}
	subclass.defaults = defaults;
	subclass.prototype = new Processor();
	subclass.prototype.constructor = subclass;
	return subclass;
}

/*
 *	Processor#process(file, callback)
 *		Process the given file performing class-specific manipulations
 *
 *	file: object representing the file including setters/getters for its 
 *		content, stats, path, etc
 *	callback: function to call when processing is complete. signature is
 *		callback(err, msg).
 *
 *	When complete, call the callback. In case of an error pass an error
 *	object or a message for <err>, and a null <msg>. If no error, pass 
 *	null for <err> and pass anything for <msg>.
 */
Processor.prototype.process = function(file, callback) {}

module.exports = Processor;