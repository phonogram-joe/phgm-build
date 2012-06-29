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
var _ = require('underscore');
var action = require('./action');
var file = require('../utils/file');
var Url = require('../utils/url');

TransformJs = action.inherit();

TransformJs.prototype.processFile = function(filepath) {
	var content
		, self = this;
	if (path.extname(filepath) !== '.js') {
		return;
	}
	if (!this.config.rewrite_urls) {
		return;
	}
	this.logger.info({
		ja: 'JavaScriptを編集します。',
		en: 'Rewriting JavaScript.',
		path: filepath
	});
	content = fs.readFileSync(filepath, 'utf8');
	content = Url.replaceUrls(content, function(theUrl) {
		var newUrl;
		newUrl = Url.resolveUrl(theUrl, self.fileChanges, filepath, self.workingDir);
		if (newUrl !== theUrl) {
			self.logger.info({
				ja: 'URLを書き換える。',
				en: 'Rewriting URL.',
				from: theUrl,
				to: newUrl
			});
		}
		return newUrl;
	});
	fs.writeFileSync(filepath, content, 'utf8');
}

module.exports = TransformJs;