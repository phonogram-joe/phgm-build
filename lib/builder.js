var path = require('path');
var _ = require('underscore');

var Builder = function() {
	this.root = path.dirname(path.dirname(process.argv[1]));
	this.templateRoot = path.join(this.root, 'templates');
	this.commandsRoot = path.join(this.root, 'lib', 'commands');
	this.tasksRoot = path.join(this.root, 'lib', 'tasks');
}
Builder.prototype.templateFor = function(fileName) {
	return path.join(this.templateRoot, fileName);
}
Builder.prototype.fail = function() {
	_(arguments).each(function(message) {
		console.error(message);
	});
	console.error('FAIL');
	process.exit(1);
}
Builder.prototype.log = function() {
	_(arguments).each(function(message) {
		console.log(message);
	});
}

module.exports = new Builder();