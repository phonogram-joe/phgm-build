/*
 * phgm-build
 * https://github.com/phonogram-joe/phgm-build
 *
 * Copyright (c) 2012 Joseph C. Savona
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
var path = require('path');
var fs = require('fs');
var action = require('./action');
var file = require('../utils/file');

var RewriteText = action.inherit();

RewriteText.prototype.init = function() {
	this.include = 'include' in this.config ? new RegExp(this.config.include) : null;
}

RewriteText.prototype.processFile = function(filepath) {
	var self = this,
		contents;

	if (this.include == null) {
		return null;
	}
	if (!this.include.test(filepath)) {
		return;
	}

	this.logger.info({
		ja: 'テキスト内容を書き換えます。',
		en: 'Rewriting text contents',
		path: filepath
	});

	contents = fs.readFileSync(filepath, 'utf8');

	this.config.rewrites.forEach(function(rewrite) {
		var regexp = new RegExp(rewrite.pattern, 'g'),
			replacement = rewrite.replace;
		contents = contents.replace(regexp, replacement);
	});
	fs.writeFileSync(filepath, contents, 'utf8');
}

module.exports = RewriteText;