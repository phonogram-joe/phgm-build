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
	this.ext = 'ext' in this.config ? this.config.ext : '.js';
}

MinifyJs.prototype.processFile = function(filepath) {
	var source,
		fileDest,
		ast;
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

	ast = this.parser.parse(source);
	ast = this.uglify.ast_mangle(ast);
	ast = this.uglify.ast_squeeze(ast);
	source = this.uglify.gen_code(ast);

	//	wrap source in closure.
	if (!/^\s*(\!|\(|;)?\s*function/.test(source)) {
		source = '(function() {' + source + '})();';
	}

	//	ensure closing semicolon - necessary for file concatenation to work safely.
	if (!/;$/.test(source)) {
		source += ';';
	}
	
	fs.writeFileSync(fileDest, source, 'utf8');
	if (fileDest !== filepath) {
		this.fileChanges.moveFile(filepath, fileDest);
	}
}

module.exports = MinifyJs;