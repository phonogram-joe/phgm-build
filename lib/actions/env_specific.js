/*
 * phgm-build
 * https://github.com/phonogram-joe/phgm-build
 *
 * Copyright (c) 2012 Joseph C. Savona
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
var fs = require('fs');
var path = require('path');
var action = require('./action');
var file = require('../utils/file');

var EnvSpecific = action.inherit();

EnvSpecific.prototype.init = function(app) {
	if (!('active' in this.config)) {
		this.logger.emergency({
			ja: '環境別のファイル選択する("env")には有効な環境名("active")を指定してください。',
			en: 'For the "env" task, please specify the "active" environment.'
		});
	}
	this.active = this.config.active;
	if (this.active.indexOf('.') !== 0) {
		this.active = '.' + this.active;
	}
}

EnvSpecific.prototype.processFile = function(filepath) {
	var matches,
		realPath;
	if (path.extname(filepath) !== this.active) {
		return;
	}
	realPath = path.join(path.dirname(filepath), path.basename(filepath, this.active));
	matches = file.expand(realPath + '*');
	for (var i = 0; i < matches.length; i++) {
		matches[i] = path.normalize(matches[i]);
		if (matches[i] === filepath) {
			continue;
		}
		this.logger.info({
			ja: '無効な環境のファイルを消す。',
			en: 'Deleting inactive environment file.',
			file: matches[i]
		});
		this.fileChanges.deleteFile(matches[i]);
	}
	this.logger.info({
		ja: '環境のファイルを有効にする。',
		en: 'Activating environment file',
		src: filepath,
		dest: realPath
	});
	fs.renameSync(filepath, realPath);
	this.fileChanges.moveFile(filepath, realPath);
}

module.exports = EnvSpecific;