var path = require('path');
var action = require('./action');
var file = require('../utils/file');

var Copy = action.inherit();

Copy.prototype.init = function(app) {
	this.src = app.getPath(this.config.src);
	this.dest = app.getPath(this.config.dest);

	if (this.config.clean_first) {
		file.cleanDir(this.dest);
		file.mkdir(this.dest);
	}
}

Copy.prototype.process = function() {
	this.processAll(this.src);
	if (this.config.change_directory) {
		this.setWorkingDir(this.dest);
	}
	this.callback.next();
}

Copy.prototype.processFile = function(filepath) {
	var relative,
		fileDest;
	if (!this.fileChanges.isFinalPath(filepath)) {
		return;
	}
	relative = path.relative(this.src, filepath);
	fileDest = path.resolve(this.dest, relative);

	console.log(
		'ファイルをコピーします。',
		'Copying file.',
		filepath,
		fileDest
	);
	file.copy(filepath, fileDest);
}

module.exports = Copy;