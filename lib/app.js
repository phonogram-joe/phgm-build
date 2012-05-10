var file = require('./utils/file');
var path = require('path');
var builder = require('./builder');

var App = function() {
	this.path = process.cwd();
	this.configPath = path.join(this.path, 'phgm-build.json');
}
App.prototype.configExists = function() {
	return path.existsSync(this.configPath);
}
App.prototype.loadConfig = function() {
	try {
		return file.readJSON(this.configPath);
	} catch (e) {
		if (!this.configExists()) {
			console.error('設定ファイルは見つかりません。');
		} else {
			console.error('設定ファイルは正しく読み込めませんでした。形式を確認ください。');
		}
		console.error(this.configPath);
		console.error('FAIL');
		process.exit(1);
	}
}
App.prototype.createConfig = function() {
	var source = builder.templateFor('config.json');
	console.log('設定ファイルを作成します。');
	console.log('Creating configuration file.');
	file.copy(source, this.configPath);
	console.log('OK');
}

module.exports = new App();