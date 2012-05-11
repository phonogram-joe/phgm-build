var path = require('path');
var fs = require('fs');
var lesscss = require('less');
var _ = require('underscore');
var task = require('./task');
var file = require('../utils/file');

var Less = task.inherit();

Less.defaultConfig.minify = false;
Less.defaultConfig.root_files = [];

Less.prototype.initialize = function() {
	this.files = [];
	for (var i = 0; i < this.taskConfig.root_files.length; i++) {
		this.files.push(path.join(this.workingDir, this.taskConfig.root_files[i]));
	}
}

Less.prototype.process = function() {
	if (this.taskConfig.root_files.length === 0) {
		//	if no less files explicitly specified, then search for all .less files
		task.process.call(this);
	}
	this.compileLess();
}

Less.prototype.processFile = function(filepath) {
	if (path.extname(filepath) !== '.less') {
		return;
	}
	this.log(
		'LESSファイルとしてコンパイルする。',
		'LESS file found.',
		filepath
	);
	this.files.push(filepath);
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
		var less,
			cssPath;
		cssPath = path.join(path.dirname(filepath), path.basename(filepath, '.less') + '.css');
		less = new (lesscss.Parser)({
			paths: searchPaths,
			filename: path.basename(filepath)
		});
		self.log(
			'LESSファイルをCSSにコンパイルします。',
			'Compiling LESS -> CSS file',
			cssPath
		);
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
			css = tree.toCSS({ 
				compress: self.taskConfig.minify
			});
			fs.writeFileSync(cssPath, css, 'utf8');
			self.log(
				cssPath,
				'OK'
			);
			self.fileChanges.moveFile(filepath, cssPath);
		});
	});
}

module.exports = Less;