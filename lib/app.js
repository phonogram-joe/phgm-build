var path = require('path');
var _ = require('underscore');
var file = require('./utils/file');
var builder = require('./builder');

var CONFIG_FILE_NAME = 'phuild.json';

var findAppPath = function() {
	var appRoot = path.join(process.cwd()),
		nextRoot;
	while (!path.existsSync(path.join(appRoot, App.CONFIG_FILE_NAME))) {
		if (!path.existsSync(path.dirname(appRoot))) {
			appRoot = null;
			break;
		}
		nextRoot = path.dirname(appRoot);
		if (nextRoot === appRoot) {
			appRoot = null;
			break;
		}
		appRoot = nextRoot;
	}
	return appRoot ? appRoot : process.cwd();
}

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
		process.exit(1);
	}
}

var App = {
	path: null
	, configPath: null
	, config: null
};

App.path = findAppPath();
App.configPath = path.join(App.path, CONFIG_FILE_NAME);
App.config = loadConfig(App.configPath);

App.getPath = function(pathtype) {
	var resultpath;
	if (!this.config.paths.hasOwnProperty(pathtype)) {
		builder.fail(
			'そういうパスは設定されてません。',
			'Path type is not defined in config',
			pathtype
		);
	}
	resultpath = this.config.paths[pathtype];
	if (/\.\./.test(resultpath)) {
		process.exit();
	}
	if (!file.isPathAbsolute(resultpath)) {
		resultpath = path.join(this.path, resultpath);
	}
	console.log('path for ' + pathtype + ' is ' + resultpath);
	return resultpath;
}

module.exports = App;
