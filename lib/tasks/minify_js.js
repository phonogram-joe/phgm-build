var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var uglify = require('uglify-js');
var task = require('./task');
var file = require('../utils/file');

var MinifyJs = task.inherit();

MinifyJs.defaultConfig.ext = '.js';

MinifyJs.prototype.initialize = function() {
	this.source = path.join(process.cwd(), this.appConfig.paths.source);
	this.publish = path.join(process.cwd(), this.appConfig.paths.publish);
	this.parser = uglify.parser;
	this.uglify = uglify.uglify;
}
MinifyJs.prototype.isProcessable = function(filepath) {
	return path.extname(filepath) === '.js';
}
MinifyJs.prototype.process = function(filepath) {
	var source = fs.readFileSync(filepath, 'utf8'),
		ast = this.parser.parse(source),
		relative = path.relative(this.source, filepath),
		fileDest = path.resolve(this.publish, relative),
	fileDest = path.join(path.dirname(fileDest), path.basename(filepath, '.js') + this.taskConfig.ext);
	ast = this.uglify.ast_mangle(ast);
	ast = this.uglify.ast_squeeze(ast);
	source = this.uglify.gen_code(ast);

	this.log(
		'JavaScriptを圧縮します。',
		'Minifying JavaScript',
		relative,
		fileDest
	);
	file.mkdir(path.dirname(fileDest));
	fs.writeFileSync(fileDest, source, 'utf8');
	this.log('OK');

	return false;
}

module.exports = MinifyJs;