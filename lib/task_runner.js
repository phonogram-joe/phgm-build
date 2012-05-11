var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var file = require('./utils/file');
var app = require('./app');
var builder = require('./builder');

var task_classes = {};

(function() {
	var filelist = fs.readdirSync(builder.tasksRoot);
	filelist.forEach(function(filepath) {
		var taskName;
		if (filepath === '.' || filepath === '..') {
			return;
		}
		taskName = path.basename(filepath, path.extname(filepath));
		task_classes[taskName] = require(path.join(builder.tasksRoot, filepath));
	});
})();

/*
	patternsToRegExp(array, valueWhenEmpty)
		array - array of strings (regexp patterns)
		valueWhenEmpty - true/false

	returns a function callback:

	callback(string)

	returns true if the string matches any of the array string patterns
	given above, false if it does not match.

	if the array was empty, callback() will always return valueWhenEmpty.
 */
var patternsToRegExp = function(array, valueWhenEmpty) {
	var patterns;
	if (_.isFunction(array)) {
		return array;
	}
	if (array.length === 0) {
		return function(filepath) {
			return valueWhenEmpty;
		}
	};
	patterns = _.map(array, function(pattern) {
		return new RegExp(pattern, 'i');
	});
	return function(filepath) {
		for (var i = 0; i < patterns.length; i++) {
			if (patterns[i].test(filepath)) {
				return true;
			}
		}
		return false;
	}
}

var TaskRunner = function(app, filesetName, workingDir, fileChanges) {
	var filesetConfig,
		appConfig,
		i,
		taskConfig,
		task,
		taskName;

	appConfig = app.getConfig();
	if (!appConfig.filesets.hasOwnProperty(filesetName)) {
		builder.fail(
			'ファイル・グループは設定されていません。',
			'File set is not defined in config',
			filesetName
		);
	}
	filesetConfig = appConfig.filesets[filesetName];
	this.app = app;
	this.workingDir = workingDir;
	this.filesetName = filesetName;
	this.include = patternsToRegExp(filesetConfig.include, true);
	this.exclude= patternsToRegExp(filesetConfig.exclude, false);
	this.filesetIncludes = filesetConfig.fileset_includes;
	this.taskNames = filesetConfig.tasks;
	this.tasks = [];
	this.fileChanges = fileChanges;

	for (i = 0; i < this.taskNames.length; i++) {
		taskName = this.taskNames[i];
		if (!task_classes.hasOwnProperty(taskName)) {
			builder.fail(
				'そのようなタスクはありません。',
				'Task does not exist',
				taskName
			);
		}
		if (!appConfig.task_defaults.hasOwnProperty(taskName)) {
			appConfig.task_defaults[taskName] = {};
		}
		if (!filesetConfig.task_config.hasOwnProperty(taskName)) {
			filesetConfig.task_config[taskName] = {};
		}
		task = new task_classes[taskName]();
		taskConfig = _.extend(
			{}, 
			task_classes[taskName].defaultConfig, 
			appConfig.task_defaults[taskName], 
			filesetConfig.task_config[taskName]
		);
		taskConfig.include = patternsToRegExp(taskConfig.include, true);
		taskConfig.exclude = patternsToRegExp(taskConfig.exclude, false);	
		task.init(app, taskConfig, this.workingDir, this.fileChanges);
		this.tasks.push(task);
	}
}
TaskRunner.prototype.run = function() {
	var self = this;
	builder.log('starting fileset ' + this.filesetName);
	this.filesetIncludes.forEach(function(filesetName) {
		var taskRunner = new TaskRunner(this.app, this.workingDir, filesetName, self.fileChanges);
		taskRunner.run();
	});
	this.tasks.forEach(function(task) {
		builder.log('starting task ' + self.taskNames[self.tasks.indexOf(task)]);
		task.process();
	});
}

module.exports = TaskRunner;