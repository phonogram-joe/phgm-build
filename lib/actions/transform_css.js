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
		if (!/^([\/\._a-zA-Z0-9])/.test(assetpath)) {
			return str;
		} else if (assetpath.indexOf('/') === 0) {
			assetpath = path.join(self.workingDir, assetpath);
		} else if (assetpath.indexOf('.') === 0) {
			assetpath = path.resolve(path.dirname(filepath), assetpath);
		} else {
			assetpath = path.join(path.dirname(filepath), assetpath);
		}
		assetpath = self.fileChanges.getFinalPath(assetpath);
		assetpath = '/' + path.relative(self.workingDir, assetpath);
		assetpath = assetpath.replace(/\\/g, '/');
		return 'url("' + assetpath + '")';
	});
}

module.exports = TransformCss;