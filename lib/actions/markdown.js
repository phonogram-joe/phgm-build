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

var htmlRegexp = {
	comment: /<!--[^>]*-->/gm,
	selfClosing: /<[^>]+\/>/gm,
	openToClose: /<[^>]*>[^>]*<\s*\/[^>]*>/gm,
	tagOnly: /<[^>]*>/gm
}

var Markdown = action.inherit();

Markdown.prototype.init = function(app) {
	this.src = 'src' in this.config ? app.getPath(this.config.src) : this.workingDir;
	this.dest = 'dest' in this.config ? app.getPath(this.config.dest) : this.src;
	//	allow html in the original markdown source to pass through untouched
	//	default: discard html in source. only html in output comes from the markdown->html conversion
	this.allowHtml = 'allow_html' in this.config && this.config.allow_html === 'true' ? true : false;
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
	if (!this.allowHtml) {
		//	strip self-closing tags
		while (htmlRegexp.selfClosing.test(content)) {
			content = content.replace(htmlRegexp.selfClosing, '');
		}
		//	strip html comments
		while (htmlRegexp.comment.test(content)) {
			content = content.replace(htmlRegexp.comment, '');
		}
		//	strip child-tags (tags with no children tags, only text content)
		while (htmlRegexp.openToClose.test(content)) {
			content = content.replace(htmlRegexp.openToClose, '');
		}
		//	strip just tags themselves (closing, self-closing, or orphaned).
		while (htmlRegexp.tagOnly.test(content)) {
			content = content.replace(htmlRegexp.tagOnly, '');
		}
	}
	content = markdown.parse(content);

	file.mkdir(path.dirname(htmlPath));
	fs.writeFileSync(htmlPath, content, 'utf8');
	this.fileChanges.moveFile(filepath, htmlPath);
}

module.exports = Markdown;