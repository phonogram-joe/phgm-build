var path = require('path');
var fs = require('fs');
var task = require('./task');
var file = require('../utils/file');

var RewriteText = task.inherit();
RewriteText.defaultConfig.rewrite = [];
RewriteText.prototype.initialize = function() {
	this.source = path.join(process.cwd(), this.appConfig.paths.source);
	this.publish = path.join(process.cwd(), this.appConfig.paths.publish);
}
RewriteText.prototype.process = function(filepath) {
	var relative = path.relative(this.source, filepath),
		fileDest = path.resolve(this.publish, relative),
		self = this,
		contents;
		/*
	if (!path.exists(fileDest)) {
		this.fail(
			'テキストの書換はコピー後に行うように設定してください。',
			'Please perform text rewrites after copying files',
			fileDest
		);
	}
	*/
	this.log(
		'テキスト内容を書き換えます。',
		'Rewriting text contents',
		relative
	);
	contents = fs.readFileSync(fileDest, 'utf8');
	this.taskConfig.rewrite.forEach(function(rewrite) {
		var regexp = new RegExp(rewrite.pattern, 'g'),
			replacement = rewrite.replace;
		contents = contents.replace(regexp, replacement);
	});
	fs.writeFileSync(fileDest, contents, 'utf8');

	return true;
}

module.exports = RewriteText;