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
}

MinifyJs.prototype.processFile = function(filepath) {
	var source,
		ast;
	if (path.extname(filepath) !== '.js') {
		return false;
	}

	console.log(
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
}

module.exports = MinifyJs;