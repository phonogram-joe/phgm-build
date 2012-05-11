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
		process.exit(1);
	}
}

var App = function() {
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

	this.path = appRoot ? appRoot : process.cwd();
	this.configPath = path.join(this.path, App.CONFIG_FILE_NAME);
	this.config = null;
}
App.CONFIG_FILE_NAME = 'phgm-build.json';

App.prototype.getPath = function(pathtype) {
	this.getConfig();
	if (!this.config.paths.hasOwnProperty(pathtype)) {
		builder.fail(
			'そういうパスは設定されてません。',
			'Path type is not defined in config',
			pathtype
		);
	}
	console.log('path for ' + pathtype + ' is ' + path.join(this.path, this.config.paths[pathtype]));
	return path.join(this.path, this.config.paths[pathtype]);
}

App.prototype.getConfig = function() {
	if (!this.config) {
		this.config = loadConfig(this.configPath);
	}
	return this.config;
}

App.prototype.configExists = function() {
	return path.existsSync(this.configPath);
}

App.prototype.createConfig = function() {
	var source = builder.templateFor('config.json');
	builder.log(
		'設定ファイルを作成します。',
		'Creating configuration file.'
	);
	file.copy(source, this.configPath);
	builder.log('OK');
}

module.exports = new App();
