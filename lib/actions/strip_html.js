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

var htmlRegexp = {
	comment: /<!--[^>]*-->/gm,
	selfClosing: /<[^>]+\/>/gm,
	openToClose: /<[^>]*>[^>]*<\s*\/[^>]*>/gm,
	tagOnly: /<[^>]*>/gm
}

var StripHtml = action.inherit();

StripHtml.prototype.init = function(app) {
	this.src = 'src' in this.config ? app.getPath(this.config.src) : this.workingDir;
	this.dest = 'dest' in this.config ? app.getPath(this.config.dest) : this.src;
}

StripHtml.prototype.process = function() {
	this.processAll(this.src);
	this.callback.next();
}

StripHtml.prototype.processFile = function(filepath) {
	var extname = path.extname(filepath),
		content;
	if (!(extname === '.md' || extname === '.markdown')) {
		return;
	}

	this.logger.info({
		ja: '埋め込まれてるHTMLを取り抜きます。',
		en: 'Removing embedded HTML.',
		path: filepath,
	});

	content = fs.readFileSync(filepath, 'utf8');
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

	fs.writeFileSync(filepath, content, 'utf8');
}

module.exports = StripHtml;