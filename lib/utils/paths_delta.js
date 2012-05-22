/*
 * phgm-build
 * https://github.com/phonogram-joe/phgm-build
 *
 * Copyright (c) 2012 Joseph C. Savona
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
var _ = require('underscore');

var PathsDelta = function() {
	this.renames = {};
	this.oldnames = {};
	this.orderedPaths = [];
	this.data = {};
}

PathsDelta.prototype.moveFile = function(filepath, fileDest) {
	if (filepath === fileDest) {
		return;
	}
	if (this.orderedPaths.indexOf(filepath) < 0) {
		this.orderedPaths.push(filepath);
	}
	this.renames[filepath] = fileDest;
	this.oldnames[fileDest] = filepath;
}

PathsDelta.prototype.deleteFile = function(filepath) {
	if (this.orderedPaths.indexOf(filepath) < 0) {
		this.orderedPaths.push(filepath);
	}
	this.renames[filepath] = null;
}

PathsDelta.prototype.addFiles = function() {
	var self = this;
	_.forEach(arguments, function(filepath) {
		if (self.orderedPaths.indexOf(filepath) < 0) {
			self.orderedPaths.push(filepath);
		}
	});
}

PathsDelta.prototype.setData = function(filepath, key, data) {
	if (!(filepath in this.data)) this.data[filepath] = {};
	this.data[filepath][key] = data;
}
PathsDelta.prototype.getData = function(filepath, key) {
	return filepath in this.data ? this.data[filepath][key] : null;
}

PathsDelta.prototype.getFinalList = function() {
	var filepath,
		nextpath,
		list = [];
	for (var i = 0; i < this.orderedPaths.length; i++) {
		filepath = this.orderedPaths[i];
		while (filepath != null && (filepath in this.renames)) {
			if (filepath === this.renames[filepath]) {
				break;
			}
			nextpath = this.renames[filepath];
			delete this.renames[filepath];
			filepath = nextpath;
		}
		if (filepath) {
			list.push(filepath);
		}
	}
	return list;
}

PathsDelta.prototype.getFinalPath = function(filepath) {
	while (filepath != null && filepath in this.renames) {
		filepath = this.renames[filepath];
	}
	return filepath;
}

PathsDelta.prototype.getSourcePath = function(filepath) {
	while (filepath != null && filepath in this.oldnames) {
		filepath = this.oldnames[filepath];
	}
	return filepath;
}

PathsDelta.prototype.isFinalPath = function(filepath) {
	var finalpath = this.getFinalPath(filepath);
	return finalpath === filepath;
}

PathsDelta.prototype.isSourcePath = function(filepath) {
	var sourcepath = this.getSourcePath(filepath);
	return sourcepath === filepath;
}

module.exports = PathsDelta;