var path = require('path');
var fs = require('fs');
var lesscss = require('less');
var _ = require('underscore');
var task = require('./task');
var file = require('../utils/file');

var Less = task.inherit();

Less.defaultConfig.compress = false;
Less.defaultConfig.root_files = [];

Less.prototype.initialize = function() {
	this.source = path.join(process.cwd(), this.appConfig.paths.source);
	this.publish = path.join(process.cwd(), this.appConfig.paths.publish);
	this.files = [];
	this.htmlFiles = [];
	for (var i = 0; i < this.taskConfig.root_files.length; i++) {
		this.files.push(path.join(this.source, this.taskConfig.root_files[i]));
	}
}
Less.prototype.isProcessable = function(filepath) {
	return path.extname(filepath) === '.less';
}
Less.prototype.process = function(filepath) {
	if (this.taskConfig.root_files.length > 0) {
		return false;
	}
	this.files.push(filepath);
	this.log(
		'LESSファイルとしてコンパイルする。',
		'LESS file found.',
		filepath
	);
	return false;
}
Less.prototype.complete = function() {
	this.compileLess();
}
Less.prototype.compileLess = function() {
	var searchPaths,
		self = this;
	searchPaths = _.chain(this.files)
		.map(function(filepath) {
			return path.dirname(filepath);
		})
		.uniq()
		.value();
	this.files.forEach(function(filepath) {
		var css,
			less,
			relative = path.relative(self.source, filepath),
			fileDest = path.resolve(self.publish, relative),
			content;
		fileDest = path.join(path.dirname(fileDest), path.basename(filepath, '.less') + '.css');
		less = new (lesscss.Parser)({
			paths: searchPaths,
			filename: path.basename(filepath)
		});
		less.parse(fs.readFileSync(filepath, 'utf8'), function(err, tree) {
			var css;
			if (err) {
				self.error(
					'LESSエラーが発生しました。', 
					err.name, 
					err.message, 
					err.filename, 
					filepath
				);
			}
			self.log(
				'LESSファイルをCSSにコンパイルします。',
				'Compiling LESS -> CSS file',
				relative,
				fileDest
			);
			css = tree.toCSS({ 
				compress: self.taskConfig.compress
			});
			file.mkdir(path.dirname(fileDest));
			fs.writeFileSync(fileDest, css, 'utf8');
			self.log('OK');
		});
	});
}

module.exports = Less;