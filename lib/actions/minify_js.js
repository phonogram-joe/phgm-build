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
var uglify = require('uglify-js');
var action = require('./action');
var file = require('../utils/file');

var MinifyJs = action.inherit();

MinifyJs.prototype.init = function() {
	this.parser = uglify.parser;
	this.uglify = uglify.uglify;
	this.ignore = 'ignore' in this.config ? new RegExp(this.config.ignore) : null;
	this.ext = 'change_ext' in this.config ? this.config.change_ext : '.js';
	this.config.keep_original = 'keep_original' in this.config && this.config.keep_original === true ? true : false;
}

MinifyJs.prototype.processFile = function(filepath) {
	var source,
		fileDest,
		ast,
		commentStart,
		commentEnd,
		comments;
	if (path.extname(filepath) !== '.js') {
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
		ja: 'JavaScriptを圧縮します。',
		en: 'Minifying JavaScript',
		path: filepath
	});

	source = fs.readFileSync(filepath, 'utf8');

	//	find 'special' comments of form /*! ... */
	commentStart = 0;
	commentEnd = 0;
	comments = [];
	while (commentEnd < source.length) {
		commentStart = source.indexOf('/*!', commentEnd);
		commentEnd = source.indexOf('*/', commentStart);
		if (commentStart < 0 || commentEnd < 0) {
			break;
		}
		comments.push(source.substring(commentStart, commentEnd + 2));
	}

	ast = this.parser.parse(source);
	ast = this.uglify.ast_mangle(ast);
	ast = this.uglify.ast_squeeze(ast);
	source = this.uglify.gen_code(ast);

	//	ensure that source is wrapped in a closure
	if (!/^\s*(\!|\(|;)?\s*function/.test(source)) {
		source = '(function() {' + source + '})();';
	}

	//	ensure closing semicolon - necessary for file concatenation to work safely.
	if (!/;$/.test(source)) {
		source += ';';
	}
	
	//	add all 'special' comments back to beginning of file
	for (var i = 0; i < comments.length; i++) {
		source = comments[i] + '\n' + source;
	}

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

module.exports = MinifyJs;