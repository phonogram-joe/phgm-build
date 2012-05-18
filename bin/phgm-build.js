#!/usr/bin/env node

/*
 * phgm-build
 * https://github.com/phonogram-joe/phgm-build
 *
 * Copyright (c) 2012 Joseph C. Savona
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
var program = require('commander');
var path = require('path');
var file = require('../lib/utils/file');
var logger = require('../lib/utils/logger').getLogger('notice', 'phuild.log.txt');
var builder = require('../lib/builder');
var app = require('../lib/app');
var PathsDelta = require('../lib/utils/paths_delta');
var TaskRunnerAsync = require('../lib/task_runner');

program
	.version('0.0.1')
	.usage('[options] [task]')
	.option('-i, --init', 'create sample config file if not present.')
	.option('-s, --scaffold <path>', 'create a full site scaffold from the sample at <path>.')
	.option('-c, --config <path>', 'use the config file at <path>. ')
	.option('-V, --verbose', 'enable verbose logging.')

program
	.command('*')
	.description('指定のタスクを実行する。\nExecute the specified task.')
	.action(function(taskName) {
		var runner,
			fileChanges,
			callback,
			taskConfig;

		if (this.init === true || this.scaffold != null) {
			return;
		}
		if (this.verbose) {
			logger.setLevel('info');
		}
		if (this.config != null) {
			app.setConfigPath(this.config);
		}
		app.loadConfig();

		logger.notice({
			ja: 'ビルドを準備しています。',
			en: 'PREPARING BUILD'
		});

		taskConfig = app.config.tasks[taskName];
		fileChanges = new PathsDelta();
		callback = function() {
			logger.notice({
				ja: 'ビルド完了',
				en: 'BUILD COMPLETE'
			});
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
		logger.emergency({
			ja: '設定ファイルは既に作られています。', 
			en: 'Config file already exists.', 
			path: app.configPath
		});
		process.exit(1);
	}
	logger.info({
		ja: 'サンプル設定ファイルを作成します。', 
		en: 'Creating sample config file.', 
		path: app.configPath
	});
	file.copy(builder.getTemplate(app.configFileName), app.configPath);
	logger.info({
		ja: 'コピー完了',
		en: 'OK'
	})
	process.exit(0);
}

if (program.scaffold) {
	var scaffoldPath = path.join(app.path, program.scaffold);
	if (file.isSubDirectory(scaffoldPath, app.path)) {
		logger.emergency({
			ja: '現フォルダーより下のパスを指定してください。',
			en: 'Please specify a sub-folder of current directory.'
		});
	}
	builder.scaffoldSite(scaffoldPath);
}

