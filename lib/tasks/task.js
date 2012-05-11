var _ = require('underscore');
var builder = require('../builder');
var file = require('../utils/file');

var Task = function() {

}

Task.inherit = function() {
	var subclass = function() {};
	subclass.defaultConfig = {
		include: [],
		exclude: []
	}
	subclass.prototype = new Task();
	return subclass;
}

Task.prototype.init = function(app, taskConfig, workingDir, fileChanges) {
	this.app = app;
	this.taskConfig = taskConfig;
	this.workingDir = workingDir;
	this.fileChanges = fileChanges;
	this.initialize();
}

Task.prototype.initialize = function() {

}

Task.prototype.isMatch = function(filepath) {
	return this.taskConfig.include(filepath) && !this.taskConfig.exclude(filepath);
}

Task.prototype.process = function() {
	file.recurse(this.workingDir, _.bind(this.processIfMatch, this));
}

Task.prototype.processIfMatch = function(filepath) {
	if (!this.isMatch(filepath)) {
		return;
	}
	this.processFile(filepath);
}

Task.prototype.processFile = function(filepath) {
	this.fileChanges.addFiles(filepath);
}

Task.prototype.fail = function() {
	builder.fail.apply(builder, arguments);
}

Task.prototype.log = function() {
	builder.log.apply(builder, arguments);
}

module.exports = Task;