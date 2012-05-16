var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var cleanCSS = require('clean-css');
var action = require('./action');
var file = require('../utils/file');

var MinifyCss = action.inherit();

MinifyCss.prototype.init = function() {
	this.ignore = 'ignore' in this.config ? new RegExp(this.config.ignore) : null;
	this.ext = 'ext' in this.config ? this.config.ext : '.js';
}

MinifyCss.prototype.processFile = function(filepath) {
	var source,
		fileDest;
	if (path.extname(filepath) !== '.css') {
		return;
	}
	if (this.ignore != null && this.ignore.test(filepath)) {
		return;
	}
	fileDest = path.join(
		path.dirname(filepath), 
		path.basename(filepath, path.extname(filepath)) + this.ext
	);

	console.log(
		'CSSを圧縮します。',
		'Minifying CSS',
		filepath
	);

	source = fs.readFileSync(filepath, 'utf8');
	source = cleanCSS.process(source);

	fs.writeFileSync(fileDest, source, 'utf8');
	if (fileDest !== filepath) {
		this.fileChanges.moveFile(filepath, fileDest);
	}
}

module.exports = MinifyCss;