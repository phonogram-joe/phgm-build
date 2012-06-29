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
	this.logger.info({
		ja: 'LESSファイルとしてコンパイルする。',
		en: 'LESS file found.',
		path: filepath
	});
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
		self.logger.info({
			ja: 'LESSファイルをCSSにコンパイルします。',
			en: 'Compiling LESS -> CSS file',
			path: cssPath
		});
		less.parse(fs.readFileSync(filepath, 'utf8'), function(err, tree) {
			var css;
			if (err) {
				self.logger.error({
					ja: 'LESSエラーが発生しました。', 
					en: 'An error occurred processing a LESS file.',
					path: filepath,
					error: err
				});
				process.exit(1);
			}
			try {
				css = tree.toCSS({});
			} catch(err) {
				self.logger.error({
					ja: 'LESSエラーが発生しました。', 
					en: 'An error occurred processing a LESS file.',
					path: filepath,
					error: err
				});
				process.exit(1);
			}
			fs.writeFileSync(cssPath, css, 'utf8');
			self.logger.info({
				ja: 'LESS→CSS変換完了',
				en: 'LESS→CSS conversion complete',
				path: cssPath
			});
			self.fileChanges.moveFile(filepath, cssPath);
			self.callback.next();
		});
	});
}

module.exports = Less;