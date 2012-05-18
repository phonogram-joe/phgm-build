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
var file = require('./utils/file');
var logger = require('./utils/logger').getLogger();

var loadActions = function(rootpath) {
	var actions = {};
	fs.readdirSync(rootpath).forEach(function(filepath) {
		var actionName;
		if (filepath === '.' || filepath === '..') {
			return;
		}
		actionName = path.basename(filepath, path.extname(filepath));
		actions[actionName] = require(path.join(rootpath, filepath));
	});
	return actions;
}

var Builder = function() {
	this.root = path.dirname(path.dirname(process.argv[1]));
	this.actions = loadActions(path.join(this.root, 'lib', 'actions'));
}

Builder.prototype.getTemplate = function(fileName) {
	return path.join(this.root, 'sample', fileName);
}

Builder.prototype.scaffoldSite = function(scaffoldRoot) {
	var templateRoot = path.join(this.root, 'sample');
	if (path.existsSync(scaffoldRoot)) {
		logger.emergency({
			ja: 'フォルダーは既に作られています。',
			en: 'Folder already exists.',
			path: scaffoldRoot
		});
		return;
	}
	file.recurse(templateRoot, function(filepath) {
		var relative = path.relative(templateRoot, filepath),
			target = path.resolve(scaffoldRoot, relative);
		logger.notice({
			ja: 'ファイルをコピーします。',
			en: 'Copying file',
			path: filepath,
			to: target
		});
		file.copy(filepath, target);
	});
}

Builder.prototype.getAction = function(name) {
	return this.actions[name];
}

module.exports = new Builder();