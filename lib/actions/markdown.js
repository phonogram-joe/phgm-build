/*
 * phgm-build
 * https://github.com/phonogram-joe/phgm-build
 *
 * Copyright (c) 2012 Joseph C. Savona
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
var fs = require('fs');
var path = require('path');
var action = require('./action');
var file = require('../utils/file');
var markdown = require('github-flavored-markdown');

var Markdown = action.inherit();

Markdown.prototype.init = function(app) {
	this.src = 'src' in this.config ? app.getPath(this.config.src) : this.workingDir;
	this.dest = 'dest' in this.config ? app.getPath(this.config.dest) : this.src;
}

Markdown.prototype.process = function() {
	this.processAll(this.src);
	this.callback.next();
}

Markdown.prototype.processFile = function(filepath) {
	var extname = path.extname(filepath),
		relative,
		htmlPath,
		content;
	if (!(extname === '.md' || extname === '.markdown')) {
		return;
	}

	relative = path.relative(this.src, path.dirname(filepath));
	htmlPath = path.resolve(this.dest, relative, path.basename(filepath, extname));

	this.logger.info({
		ja: 'MarkdownファイルをHTMLに変換する。',
		en: 'Processing Markdown→HTML',
		markdown: filepath,
		html: htmlPath
	});

	content = fs.readFileSync(filepath, 'utf8');
	content = markdown.parse(content);

	file.mkdir(path.dirname(htmlPath));
	fs.writeFileSync(htmlPath, content, 'utf8');
	this.fileChanges.moveFile(filepath, htmlPath);
}

module.exports = Markdown;