var path = require('path');
var task = require('./task');
var file = require('../utils/file');

var Copy = task.inherit();

Copy.prototype.processFile = function(filepath) {
	this.log(
		'ファイルを追加します。',
		'Including file in build.',
		filepath
	);
	this.fileChanges.addFiles(filepath);
}

module.exports = Copy;