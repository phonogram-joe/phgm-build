var path = require('path');
var fs = require('fs');
var file = require('../utils/file');
var _ = require('underscore');
var TaskRunner = require('../task_runner');

module.exports = function(program, app) {
	program
		.command('clean')
		.description('公開ビルドに関するフォルダーを削除する（一時的ファイル・公開フォルダー含め）。')
		.action(function(){
			var config = app.loadConfig(),
				source = path.join(process.cwd(), config.paths.source),
				dest = path.join(process.cwd(), config.paths.publish);

			if (path.existsSync(dest)) {
				console.log('ビルド先を削除します。');
				console.log(dest);
				file.rmdirSync(dest);
				console.log('OK');
			}
		});
}