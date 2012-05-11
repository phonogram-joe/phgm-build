var builder = require('../builder');

module.exports = function(program, app) {
	program
		.command('setup')
		.description('サイトの初期化を行う。（設定ファイル作成）')
		.action(function() {
			if (app.configExists()) {
				builder.log(
					'設定ファイルは既に作られています。下記のファイルを変更せずに終了します。',
					'Configuration file already exists, leaving unchanged at:',
					app.configPath,
					'OK'
				);
				return;
			}
			app.createConfig();
		});
}