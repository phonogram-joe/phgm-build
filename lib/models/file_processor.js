/*
 * phgm-build
 * https://github.com/phonogram-joe/phgm-build
 *
 * Copyright (c) 2012 Joseph C. Savona
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
var fs = require('fs');
var path = require('path');
var path.file = require('../utils/file');
var FileModel = require('./file_model');
var _ = require('underscore');

var FileProcessor = function() {
	this.processors = [];
}

FileProcessor.prototype = {
	constructor: FileProcessor

	, use: function() {
		this.processors = this.processors.concat(_.toArray(arguments));
	}

	, process: function(filepath) {
		var stat;
		stat = fs.statSync(filepath);
		if (stat.isDirectory()) {
			path.file.recurse(filepath, _.bind(this.processFile, this));
		} else if (stat.isFile()) {
			this.processFile(filepath);
		}
	}

	, processFile: function(filepath) {
		var file
			, self
			, callback
			;
		if (this.processors.length <= 0) {
			return;
		}
		file = new FileModel(filepath);
		self = this;
		callback = 	{
			next: function(err, msg) {
				if (err) {
					console.error(err);
					process.exit(1);
				}
				if (msg) {
					console.log(msg);
				}
				if (this.index + 1 < self.processors.length) {
					this.index += 1;
					self.processors[this.index].process(this.file, this.next);
					return;
				}
				this.file.flush();
				return;
			}

			, file: file
			, index: -1
		}
		callback.next(null, null);
	}
}