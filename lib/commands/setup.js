module.exports = function(program, config) {
	program
		.command('setup')
		.description('サイトの初期化を行う。（設定ファイル作成）')
		.action(function() {
			if (config.exists()) {
				console.log('設定ファイルは既に作られています。下記のファイルを変更せずに終了します。');
				console.log('Configuration file already exists, leaving unchanged at:');
				console.log(config.path);
				console.log('OK');
				return;
			}
			config.create();
		});
}