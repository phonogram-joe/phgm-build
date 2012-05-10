var path = require('path');
var fs = require('fs');
var file = require('../utils/file');
var _ = require('underscore');
var TaskRunner = require('../task_runner');

module.exports = function(program, app) {
	program
		.command('build <fileset>')
		.description('指定のファイル・グループをビルドする。')
		.action(function(filesetName){
			var config = app.loadConfig(),
				source = path.join(process.cwd(), config.paths.source),
				dest = path.join(process.cwd(), config.paths.publish),
				runner = new TaskRunner(config, filesetName);

			if (path.existsSync(dest)) {
				console.log('ビルド先を一旦削除します。');
				console.log(dest);
				file.rmdirSync(dest);
				console.log('OK');
			}

			console.log('ビルド先を作成します。');
			console.log(dest);
			file.mkdir(dest);
			console.log('OK');

			runner.run();
		});
}