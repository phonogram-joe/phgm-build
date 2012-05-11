var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var uglify = require('uglify-js');
var task = require('./task');
var file = require('../utils/file');

var MinifyJs = task.inherit();

MinifyJs.defaultConfig.ext = '.js';

MinifyJs.prototype.initialize = function() {
	this.parser = uglify.parser;
	this.uglify = uglify.uglify;
}

MinifyJs.prototype.processFile = function(filepath) {
	var source,
		ast;
	if (path.extname(filepath) !== '.js') {
		return false;
	}

	this.log(
		'JavaScriptを圧縮します。',
		'Minifying JavaScript',
		filepath
	);

	source = fs.readFileSync(filepath, 'utf8');

	ast = this.parser.parse(source);
	ast = this.uglify.ast_mangle(ast);
	ast = this.uglify.ast_squeeze(ast);
	source = this.uglify.gen_code(ast);
	
	fs.writeFileSync(filepath, source, 'utf8');
	this.fileChanges.addFiles(filepath);
	this.log('OK');

	return false;
}

module.exports = MinifyJs;