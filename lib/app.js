/*
 * phgm-build
 * https://github.com/phonogram-joe/phgm-build
 *
 * Copyright (c) 2012 Joseph C. Savona
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
var path = require('path');
var _ = require('underscore');
var file = require('./utils/file');
var builder = require('./builder');
var logger = require('../lib/utils/logger').getLogger();

var App = function() {
	var appRoot = process.cwd(),
		nextRoot;
	while (!path.existsSync(path.join(appRoot, App.CONFIG_FILE_NAME))) {
		nextRoot = path.dirname(appRoot);
		if (nextRoot === appRoot) {
			appRoot = null;
			break;
		}
		appRoot = nextRoot;
	}
	this.path = appRoot ? appRoot : process.cwd();
	this.configPath = path.join(this.path, App.CONFIG_FILE_NAME);
	this.config = null;
	this.configFileName = App.CONFIG_FILE_NAME;
}
App.CONFIG_FILE_NAME = 'phuild.json';

App.prototype.loadConfig = function() {
	if (this.config) {
		return;
	}
	var error;
	try {
		this.config = file.readJSON(this.configPath);
	} catch (e) {
		if (!path.existsSync(this.configPath)) {
			error = {
				ja: '設定ファイルは見つかりません。', 
				en: 'Config file not found.'
			};
		} else {
			error = {
				ja: '設定ファイルは正しく読み込めませんでした。形式を確認ください。', 
				en: 'Config file could not be processed.'
			};
		}
		error.path = this.configPath;
		logger.emergency(error);
	}
}

App.prototype.setConfigPath = function(configPath) {
	this.configPath = configPath;
	this.path = path.dirname(configPath);
}

App.prototype.hasConfig = function() {
	return path.existsSync(this.configPath);
}

App.prototype.getPath = function(pathtype) {
	var resultpath,
		parentpath;
	if (!this.config.paths.hasOwnProperty(pathtype)) {
		logger.emergency({
			ja: 'そういうパスは設定されてません。',
			en: 'Path type is not defined in config',
			pathtype: pathtype
		});
	}
	resultpath = this.config.paths[pathtype];
	if (!file.isPathAbsolute(resultpath)) {
		resultpath = path.join(this.path, resultpath);
		if (!file.isSubDirectory(this.path, resultpath)) {
			logger.emergency({
				ja: '相対パス名の場合は、子フォルダーを指定してください。', 
				en: 'When specifying a relative path, be sure it resolves to a sub-directory of the app.',
				pathtype: pathtype,
				path: resultpath
			});
		}
	}
	return resultpath;
}

module.exports = (new App);