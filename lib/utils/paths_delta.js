var _ = require('underscore');

var PathsDelta = function() {
	this.changes = {};
	this.orderedPaths = [];
}

PathsDelta.prototype.moveFile = function(filepath, fileDest) {
	if (filepath === fileDest) {
		return;
	}
	if (this.orderedPaths.indexOf(filepath) < 0) {
		this.orderedPaths.push(filepath);
	}
	this.changes[filepath] = fileDest;
}

PathsDelta.prototype.deleteFile = function(filepath) {
	if (this.orderedPaths.indexOf(filepath) < 0) {
		this.orderedPaths.push(filepath);
	}
	this.changes[filepath] = null;
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

module.exports = PathsDelta;