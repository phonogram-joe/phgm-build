#!/usr/bin/env node
var program = require('commander'),
	TaskRunnerAsync = require('../lib/task_runner'),
	PathsDelta = require('../lib/utils/paths_delta'),
	app = require('../lib/app'),
	builder = require('../lib/builder');

program
	.version('0.0.1');
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
