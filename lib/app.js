var path = require('path');
var _ = require('underscore');
var file = require('./utils/file');
var builder = require('./builder');

var App = function() {
	console.log('App instantiated');
	this.path = process.cwd();
	this.configPath = path.join(this.path, 'phgm-build.json');
	this.config = null;
}
App.prototype.configExists = function() {
	return path.existsSync(this.configPath);
}
App.prototype.loadConfig = function() {
	var error;
	if (this.config) {
		return config;
	}
	try {
		this.config = file.readJSON(this.configPath);
		return this.config;
	} catch (e) {
		if (!this.configExists()) {
			error = ['設定ファイルは見つかりません。', 'Config file not found.'];
		} else {
			error = ['設定ファイルは正しく読み込めませんでした。形式を確認ください。', 'Config file could not be processed.'];
		}
		error.push(this.configPath);
		builder.fail.apply(builder, error);
	}
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