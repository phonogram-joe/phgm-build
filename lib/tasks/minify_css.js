var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var cleanCSS = require('clean-css');
var task = require('./task');
var file = require('../utils/file');

var MinifyCss = task.inherit();

MinifyCss.defaultConfig.ext = '.css';


MinifyCss.prototype.processFile = function(filepath) {
	var source;
	if (path.extname(filepath) !== '.css') {
		return;
	}

	this.log(
		'CSSを圧縮します。',
		'Minifying CSS',
		filepath
	);

	source = fs.readFileSync(filepath, 'utf8');
	source = cleanCSS.process(source);

	fs.writeFileSync(filepath, source, 'utf8');
	this.fileChanges.addFiles(filepath);

	return false;
}

module.exports = MinifyCss;