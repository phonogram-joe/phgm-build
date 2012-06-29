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
	_.str = require('underscore.string');
var cleanCSS = require('clean-css');
var action = require('./action');
var file = require('../utils/file');
var Url = require('../utils/url');

var MinifyCss = action.inherit();

MinifyCss.prototype.init = function() {
	this.ignore = 'ignore' in this.config ? new RegExp(this.config.ignore) : null;
	this.ext = 'change_ext' in this.config ? this.config.change_ext : '.css';
	this.config.keep_original = 'keep_original' in this.config && this.config.keep_original === true ? true : false;
	this.config.inline_imports = 'inline_imports' in this.config && this.config.inline_imports === true ? true : false;
	this.filesWithImports = [];
}

MinifyCss.prototype.process = function() {
	this.processAll(this.workingDir);
	this.filesWithImports.forEach(_.bind(this.inlineImports, this));
	this.callback.next();
}

MinifyCss.prototype.processFile = function(filepath) {
	var source,
		fileDest;
	if (path.extname(filepath) !== '.css') {
		return;
	}
	if (this.ignore != null && this.ignore.test(filepath)) {
		return;
	}
	fileDest = path.join(
		path.dirname(filepath), 
		path.basename(filepath, path.extname(filepath)) + this.ext
	);

	this.logger.info({
		ja: 'CSSを圧縮します。',
		en: 'Minifying CSS',
		path: filepath
	});

	source = fs.readFileSync(filepath, 'utf8');
	if (source.indexOf('@import') >= 0) {
		this.filesWithImports.push(fileDest);
	}
	source = cleanCSS.process(source);

	fs.writeFileSync(fileDest, source, 'utf8');
	if (fileDest !== filepath) {
		this.fileChanges.moveFile(filepath, fileDest);
		if (this.config.keep_original) {
			this.fileChanges.keepFile(filepath);
		}
	} else {
		this.fileChanges.keepFile(filepath);
	}
}

MinifyCss.prototype.inlineImports = function(filepath) {
	var self = this
		, source;
	source = fs.readFileSync(filepath, 'utf8');
	source = source.replace(/@import\s+url\s*\(\s*[\'\"]?\s*([^\'\"\)]*)\s*[\'\"]?\s*\)\s*;/g, function(str, theUrl) {
		var importPath = Url.resolveFilePath(theUrl, self.fileChanges, filepath, self.workingDir)
		if (!importPath) {
			return str;
		}
		return '\n/*' + theUrl + '*/' + _.str.trim(fs.readFileSync(importPath, 'utf8')) + '\n';
	});
	fs.writeFileSync(filepath, source, 'utf8');
}

module.exports = MinifyCss;