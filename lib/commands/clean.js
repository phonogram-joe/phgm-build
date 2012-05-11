var file = require('../utils/file');
var path = require('path');
var builder = require('../builder');

module.exports = function(program, app) {
	program
		.command('clean')
		.description('公開ビルドに関するフォルダーを削除する（一時的ファイル・公開フォルダー含め）。')
		.action(function() {
			var source = app.getPath('source'),
				temporary = app.getPath('temporary'),
				publish = app.getPath('publish');

			builder.log(
				'クリーンを開始します。',
				'STARTING CLEAN'
			);

			if (path.existsSync(temporary)) {
				builder.log(
					'一時的なファイルを削除します。',
					'Deleting temporary folder',
					temporary
				);
				file.rmdirSync(temporary);
				builder.log('OK');
			}

			if (path.existsSync(publish)) {
				builder.log(
					'公開フォルダーを削除します。',
					'Deleting publish folder',
					publish
				);
				file.rmdirSync(publish);
				builder.log('OK');
			}

			builder.log(
				'クリーン完了',
				'CLEAN COMPLETE'
			);
		});
}