var path = require('path');
var fs = require('fs');
var file = require('../utils/file');
var PathsDelta = require('../utils/paths_delta');
var _ = require('underscore');
var TaskRunner = require('../task_runner');
var builder = require('../builder');

/*
	- clear working directory, copy files from source->working
				( alternative:
					- sync source->working directory
						- delete files in working directory that do not correspond to anything in source
						- copy files in source directory that are newer than the corresponding file in working dir
				* problem: certain kinds of processing (eg file concatenation) will break
				* solution(?): allow setting build config settings within each fileset config. only the active
					fileset's settings take effect (eg subsets do not). can choose in that config to use full clean
					or changed-only sync. this would allow user to define eg a 'dev' mode that doesn't concatenate
					and uses sync-only for speed, and also a 'production' mode that does concatenate and always
					uses clean & copy.
					*problem: how do tasks know which files can be skipped in a sync?
				)
	- create task runner to recursively process filesets (returns final list of included files)
				* create an initial, empty filelist
				* for each fileset
					* read the config
					* create, init, & process tasks
					* after each task, update the filelist
					* process sub-filesets
					* update the filelist
				* return the final filelist
	- clean the publish directory
	- copy files from working->publish directory (only files in the included files list)
*/

module.exports = function(program, app) {
	program
		.command('build <fileset>')
		.description('指定のファイル・グループをビルドする。')
		.action(function(filesetName) {
			var source = app.getPath('source'),
				temporary = app.getPath('temporary'),
				publish = app.getPath('publish'),
				fileChanges,
				runner;

			builder.log(
				'ビルドを準備しています。',
				'PREPARING BUILD'
			);

			builder.log(
				'一時的なファイルを一旦削除して再作成します。',
				'Clearing & recreating temporary folder',
				temporary
			);
			file.cleanDir(temporary);
			builder.log('OK');

			builder.log(
				'ファイルを一時的のフォルダーへコピーします。',
				'Copying files to temp folder for processing'
			);
			file.copyDir(source, temporary, []);
			builder.log('OK');

			builder.log(
				'ビルドのファイル処理を開始します。',
				'EXECUTING FILE PROCESSING'
			);
			fileChanges = new PathsDelta();
			runner = new TaskRunner(app, filesetName, temporary, fileChanges);
			filelist = runner.run();
			builder.log(
				'ファイル処理が完了です。',
				'FINISHED FILE PROCESSING'
			);

			builder.log(
				'公開フォルダーを一旦削除して再作成します。',
				'Clearing & recreating publish folder',
				publish
			);
			file.cleanDir(publish);
			builder.log('OK');

			builder.log(
				'ビルド掛けたファイルを公開先にコピーします。',
				'Copying built files to publish folder'
			);
			file.copyDir(temporary, publish, fileChanges.getFinalList());
			builder.log('OK');

			builder.log(
				'ビルド完了',
				'BUILD COMPLETE'
			);
		});
}