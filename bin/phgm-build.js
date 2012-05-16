#!/usr/bin/env node

/*
 * phgm-build
 * https://github.com/phonogram-joe/phgm-build
 *
 * Copyright (c) 2012 Joseph C. Savona
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
var program = require('commander'),
	TaskRunnerAsync = require('../lib/task_runner'),
	PathsDelta = require('../lib/utils/paths_delta'),
	app = require('../lib/app'),
	builder = require('../lib/builder'),
	file = require('../lib/utils/file');

program
	.version('0.0.1')
	.usage('[options] [task]')
	.option('-i, --init', 'create sample config file if not present.')
	.option('-c, --config <path>', 'use the config file at <path>. ')
	//.option('-C, --chdir <path>', 'change the working directory')
	//.option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
	//.option('-T, --no-tests', 'ignore test hook');

program
	.command('*')
	.description('指定のタスクを実行する。\nExecute the specified task.')
	.action(function(taskName) {
		var runner,
			fileChanges,
			callback,
			taskConfig;

		if (this.init === true) {
			return;
		}
		if (this.config != null) {
			app.setConfigPath(this.config);
		}
		app.loadConfig();

		builder.log(
			'ビルドを準備しています。',
			'PREPARING BUILD'
		);

		taskConfig = app.config.tasks[taskName];
		fileChanges = new PathsDelta();
		callback = function() {
			builder.log(
				'ビルド完了',
				'BUILD COMPLETE'
			);
		};

		runner = new TaskRunnerAsync(taskConfig);
		runner.setWorkingDir(app.path);
		runner.setFileChanges(fileChanges);
		runner.setCallback(callback);
		runner.process();
	});

program.parse(process.argv);

if (program.init) {
	if (app.hasConfig()) {
		console.error('設定ファイルは既に作られています。', 'Config file already exists.', app.configPath);
		process.exit(1);
	}
	console.log('サンプル設定ファイルを作成します。', 'Creating sample config file.', app.configPath);
	file.copy(builder.getTemplate(app.configFileName), app.configPath);
	console.log('OK');
	process.exit(0);
}