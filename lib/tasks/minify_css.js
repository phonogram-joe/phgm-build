var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var cleanCSS = require('clean-css');
var task = require('./task');
var file = require('../utils/file');

var MinifyCss = task.inherit();

MinifyCss.defaultConfig.ext = '.css';

MinifyCss.prototype.initialize = function() {
	this.source = path.join(process.cwd(), this.appConfig.paths.source);
	this.publish = path.join(process.cwd(), this.appConfig.paths.publish);
}
MinifyCss.prototype.isProcessable = function(filepath) {
	return path.extname(filepath) === '.css';
}
MinifyCss.prototype.process = function(filepath) {
	var source = fs.readFileSync(filepath, 'utf8'),
		relative = path.relative(this.source, filepath),
		fileDest = path.resolve(this.publish, relative),
	fileDest = path.join(path.dirname(fileDest), path.basename(filepath, '.css') + this.taskConfig.ext);

	this.log(
		'CSSを圧縮します。',
		'Minifying CSS',
		relative,
		fileDest
	);

	source = cleanCSS.process(source);

	file.mkdir(path.dirname(fileDest));
	fs.writeFileSync(fileDest, source, 'utf8');
	this.log('OK');

	return false;
}

module.exports = MinifyCss;