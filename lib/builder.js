var path = require('path');

var Builder = function() {
	this.root = path.dirname(path.dirname(process.argv[1]));
	this.templateRoot = path.join(this.root, 'templates');
	this.commandsRoot = path.join(this.root, 'lib', 'commands');
	this.tasksRoot = path.join(this.root, 'lib', 'tasks');
}
Builder.prototype.templateFor = function(fileName) {
	return path.join(this.templateRoot, fileName);
}

module.exports = new Builder();