var path = require('path');
var fs = require('fs');
var action = require('./action');
var file = require('../utils/file');

var RewriteText = action.inherit();

RewriteText.prototype.processFile = function(filepath) {
	var self = this,
		contents;

	if (path.extname(filepath) !== '.html') {
		return;
	}

	console.log(
		'テキスト内容を書き換えます。',
		'Rewriting text contents',
		filepath
	);

	contents = fs.readFileSync(filepath, 'utf8');

	this.config.rewrites.forEach(function(rewrite) {
		var regexp = new RegExp(rewrite.pattern, 'g'),
			replacement = rewrite.replace;
		contents = contents.replace(regexp, replacement);
	});
	fs.writeFileSync(filepath, contents, 'utf8');
}

module.exports = RewriteText;