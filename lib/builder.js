var path = require('path');
var fs = require('fs');
var _ = require('underscore');

var loadActions = function(rootpath) {
	var actions = {};
	fs.readdirSync(rootpath).forEach(function(filepath) {
		var actionName;
		if (filepath === '.' || filepath === '..') {
			return;
		}
		actionName = path.basename(filepath, path.extname(filepath));
		actions[actionName] = require(path.join(rootpath, filepath));
	});
	return actions;
}

var Builder = function() {
	this.root = path.dirname(path.dirname(process.argv[1]));
	this.actions = loadActions(path.join(this.root, 'lib', 'actions'));
}

Builder.prototype.getTemplate = function(fileName) {
	return path.join(this.root, 'templates', fileName);
}

Builder.prototype.getAction = function(name) {
	return this.actions[name];
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