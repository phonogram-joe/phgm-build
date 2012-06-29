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

TransformCss = action.inherit();

TransformCss.prototype.processFile = function(filepath) {
	var content;
	if (path.extname(filepath) !== '.css') {
		return;
	}
	if (!this.config.rewrite_urls) {
		return;
	}
	this.logger.info({
		ja: 'CSSを編集します。',
		en: 'Rewriting CSS.',
		path: filepath
	});
	content = fs.readFileSync(filepath, 'utf8');
	content = this.rewriteUrls(filepath, content);
	fs.writeFileSync(filepath, content, 'utf8');
}

TransformCss.prototype.rewriteUrls = function(filepath, content) {
	var self = this;
	return content.replace(/url\(\s*[\'\"]?\s*([^\'\"\)]*)\s*[\'\"]?\s*\)/g, function(str, assetpath) {
		var newUrl = Url.resolveUrl(assetpath, self.fileChanges, filepath, self.workingDir);
		self.logger.info({
			ja: 'URLを書き換える。',
			en: 'Rewriting URL.',
			from: assetpath,
			to: newUrl
		});
		return 'url("' + newUrl + '")';
	});
}

module.exports = TransformCss;