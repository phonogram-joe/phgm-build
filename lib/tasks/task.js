var builder = require('../builder');

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
Task.prototype.init = function(appConfig, taskConfig) {
	this.appConfig = appConfig;
	this.taskConfig = taskConfig;
	this.initialize();
}
Task.prototype.initialize = function() {

}
Task.prototype.isMatch = function(filepath) {
	return this.taskConfig.include(filepath) && !this.taskConfig.exclude(filepath);
}
Task.prototype.isProcessable = function(filepath) {
	return true;
}
Task.prototype.process = function(filepath) {
	return true;
}
Task.prototype.complete = function() {

}
Task.prototype.fail = function() {
	builder.fail.apply(builder, arguments);
}
Task.prototype.log = function() {
	builder.log.apply(builder, arguments);
}

module.exports = Task;