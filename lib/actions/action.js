var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var builder = require('../builder');
var app = require('../app');
var file = require('../utils/file');

var Action = function(config) {
	this.config = config;
	this.workingDir = null;
	this.fileChanges = null;
	this.callback = null;
}

Action.inherit = function() {
	var subclass = function(config) {
		this.config = config;
		this.workingDir = null;
		this.fileChanges = null;
		this.callback = null;
	}
	subclass.prototype = new Action();
	return subclass;
}

Action.prototype.getWorkingDir = function() {
	return this.workingDir;
}

Action.prototype.setWorkingDir = function(workingDir) {
	this.workingDir = workingDir;
}

Action.prototype.setCallback = function(callback) {
	this.callback = callback;
}

Action.prototype.setFileChanges = function(fileChanges) {
	this.fileChanges = fileChanges;
}

Action.prototype.init = function(app) {
	
}

Action.prototype.process = function() {
	this.processAll(this.workingDir);
	this.callback.next();
}

Action.prototype.processAll = function(dirpath) {
	file.recurse(dirpath, _.bind(this.processFile, this));
}

Action.prototype.processFile = function(filepath) {
	console.log('Action.processFile() -- override me!');
}

module.exports = Action;