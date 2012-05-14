var path = require('path');
var fs = require('fs');
var lesscss = require('less');
var _ = require('underscore');
var action = require('./action');
var file = require('../utils/file');

var Less = action.inherit();

Less.prototype.init = function() {
	var file;
	this.files = [];
	this.root_files = [];
	if (!this.config.hasOwnProperty('files')) {
		return;
	}
	for (var i = 0; i < this.config.files.length; i++) {
		file = path.join(this.workingDir, this.config.files[i]);
		this.root_files.push(file);
	}
}

Less.prototype.process = function() {
	this.processAll(this.workingDir);
	this.compileLess();
	this.callback.next();
}

Less.prototype.processFile = function(filepath) {
	if (path.extname(filepath) !== '.less') {
		return;
	}
	if (this.root_files.length > 0 && this.root_files.indexOf(filepath) < 0) {
		this.fileChanges.deleteFile(filepath);
		return;
	}
	console.log(
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
		self.callback.wait();
		cssPath = path.join(path.dirname(filepath), path.basename(filepath, '.less') + '.css');
		less = new (lesscss.Parser)({
			paths: searchPaths,
			filename: path.basename(filepath)
		});
		console.log(
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
			css = tree.toCSS({});
			fs.writeFileSync(cssPath, css, 'utf8');
			console.log(
				cssPath,
				'OK'
			);
			self.fileChanges.moveFile(filepath, cssPath);
			self.callback.next();
		});
	});
}

module.exports = Less;