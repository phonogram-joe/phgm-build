var path = require('path');
var _ = require('underscore');
var file = require('./utils/file');
var builder = require('./builder');


var loadConfig = function(configPath) {
	var error;
	try {
		return file.readJSON(configPath);
	} catch (e) {
		if (!path.existsSync(configPath)) {
			error = ['設定ファイルは見つかりません。', 'Config file not found.'];
		} else {
			error = ['設定ファイルは正しく読み込めませんでした。形式を確認ください。', 'Config file could not be processed.'];
		}
		error.push(configPath);
		builder.fail.apply(builder, error);
	}
}

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
	this.config = loadConfig(this.configPath);
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
		builder.fail(
			'そういうパスは設定されてません。',
			'Path type is not defined in config',
			pathtype
		);
	}
	resultpath = this.config.paths[pathtype];
	if (!file.isPathAbsolute(resultpath)) {
		resultpath = path.join(this.path, resultpath);
		if (!file.isSubDirectory(this.path, resultpath)) {
			console.error('相対パス名の場合は、子フォルダーを指定してください。', 'When specifying a relative path, be sure it resolves to a sub-directory of the app.');
			process.exit(1);
		}
	}
	return resultpath;
}

module.exports = (new App);