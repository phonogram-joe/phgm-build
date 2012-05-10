var file = require('./utils/file');
var path = require('path');
var builder = require('./builder');

var Config = function() {
	this.path = path.join(process.cwd(), 'phgm-build.json');
}
Config.prototype.exists = function() {
	return path.existsSync(this.path);
}
Config.prototype.load = function() {
	try {
		return file.readJSON(this.path);
	} catch (e) {
		if (!this.exists()) {
			console.error('設定ファイルは見つかりません。');
		} else {
			console.error('設定ファイルは正しく読み込めませんでした。形式を確認ください。');
		}
		console.error(this.path);
		console.error('FAIL');
		process.exit(1);
	}
}
Config.prototype.create = function() {
	var source = builder.templateFor('config.json');
	console.log('設定ファイルを作成します。');
	console.log('Creating configuration file.');
	file.copy(source, this.path);
	console.log('OK');
}

module.exports = new Config();