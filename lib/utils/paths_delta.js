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
	this.changes = {};
	this.kept = [];
	this.orderedPaths = [];
	this.movedPaths = [];
}

PathsDelta.prototype.isKnownPath = function(filepath) {
	return this.orderedPaths.indexOf(filepath) >= 0
		|| this.movedPaths.indexOf(filepath) >= 0
		|| this.kept.indexOf(filepath) >= 0;
}

PathsDelta.prototype.moveFile = function(filepath, fileDest) {
	if (filepath === fileDest) {
		return;
	}
	if (this.orderedPaths.indexOf(filepath) < 0) {
		this.orderedPaths.push(filepath);
	}
	if (this.movedPaths.indexOf(fileDest) < 0) {
		this.movedPaths.push(fileDest);
	}
	this.changes[filepath] = fileDest;
}

PathsDelta.prototype.deleteFile = function(filepath) {
	if (this.orderedPaths.indexOf(filepath) < 0) {
		this.orderedPaths.push(filepath);
	}
	this.changes[filepath] = null;
}

PathsDelta.prototype.keepFile = function(filepath) {
	this.kept.push(filepath);
}

PathsDelta.prototype.addFiles = function() {
	var self = this;
	_.forEach(arguments, function(filepath) {
		if (self.orderedPaths.indexOf(filepath) < 0) {
			self.orderedPaths.push(filepath);
		}
	});
}

PathsDelta.prototype.getFinalList = function() {
	var filepath,
		nextpath,
		list = [];
	for (var i = 0; i < this.orderedPaths.length; i++) {
		filepath = this.orderedPaths[i];
		while (filepath != null && (filepath in this.changes)) {
			if (filepath === this.changes[filepath]) {
				break;
			}
			nextpath = this.changes[filepath];
			delete this.changes[filepath];
			filepath = nextpath;
		}
		if (filepath) {
			list.push(filepath);
		}
	}
	return list;
}

PathsDelta.prototype.getFinalPath = function(filepath) {
	while (filepath != null && filepath in this.changes) {
		filepath = this.changes[filepath];
	}
	return filepath;
}

PathsDelta.prototype.isFinalPath = function(filepath) {
	var finalpath = this.getFinalPath(filepath);
	return finalpath === filepath;
}

PathsDelta.prototype.isOutputPath = function(filepath) {
	return this.isFinalPath(filepath) || this.kept.indexOf(filepath) >= 0;
}

module.exports = PathsDelta;