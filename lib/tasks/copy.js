var path = require('path');
var task = require('./task');
var file = require('../utils/file');

var Copy = task.inherit();
Copy.prototype.initialize = function() {
	this.source = path.join(process.cwd(), this.appConfig.paths.source);
	this.publish = path.join(process.cwd(), this.appConfig.paths.publish);
}
Copy.prototype.process = function(filepath) {
	var relative = path.relative(this.source, filepath),
		fileDest = path.resolve(this.publish, relative);
	this.log(
		'コピー',
		'Copying',
		relative
	);
	file.mkdir(path.dirname(fileDest));
	file.copy(filepath, fileDest);
	this.log('OK');
	return true;
}

module.exports = Copy;