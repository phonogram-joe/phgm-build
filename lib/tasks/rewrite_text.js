var path = require('path');
var fs = require('fs');
var task = require('./task');
var file = require('../utils/file');

var RewriteText = task.inherit();

RewriteText.defaultConfig.rewrite = [];

RewriteText.prototype.initialize = function() {
}

RewriteText.prototype.processFile = function(filepath) {
	var self = this,
		contents;

	this.log(
		'テキスト内容を書き換えます。',
		'Rewriting text contents',
		filepath
	);

	contents = fs.readFileSync(filepath, 'utf8');

	this.taskConfig.rewrite.forEach(function(rewrite) {
		var regexp = new RegExp(rewrite.pattern, 'g'),
			replacement = rewrite.replace;
		contents = contents.replace(regexp, replacement);
	});
	fs.writeFileSync(filepath, contents, 'utf8');
	this.fileChanges.addFiles(filepath);

	return true;
}

module.exports = RewriteText;