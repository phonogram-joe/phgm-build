var fs = require('fs');
var path = require('path');
var file = require('./utils/file');
var app = require('./app');
var builder = require('./builder');
var _ = require('underscore');

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
		return new RegExp(pattern, 'ig');
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

var TaskRunner = function(config, filesetName) {
	var self = this;
	this.config = config;
	this.filesetName = filesetName;
	if (!this.config.filesets.hasOwnProperty(filesetName)) {
		builder.fail(
			'ファイル・グループは設定されていません。',
			'File set is not defined in config',
			filesetName
		);
	}
	this.fileset = this.config.filesets[filesetName];
	this.fileset.include = patternsToRegExp(this.fileset.include, true);
	this.fileset.exclude = patternsToRegExp(this.fileset.exclude, false);
	this.tasks = [];
	this.fileset.tasks.forEach(function(taskName) {
		var config,
			task;
		if (!task_classes.hasOwnProperty(taskName)) {
			builder.fail(
				'そのタスクはありません。',
				'Task does not exist',
				taskName
			);
		}
		task = new task_classes[taskName]();
		if (!self.config.hasOwnProperty(taskName)) self.config[taskName] = {};
		if (!self.fileset.hasOwnProperty(taskName)) self.fileset[taskName] = {};
		config = _.extend({}, task_classes[taskName].defaultConfig, self.config[taskName], self.fileset.config[taskName]);
		config.include = patternsToRegExp(config.include, true);
		config.exclude = patternsToRegExp(config.exclude, false);
		task.init(self.config, config);
		self.tasks.push(task);
	});
}
TaskRunner.prototype.run = function() {
	var self = this;
	file.recurse(this.config.paths.source, _.bind(this.processFile, this));
	this.tasks.forEach(function(task) {
		task.complete();
	});
	this.fileset.filesets.forEach(function(filesetName) {
		var taskRunner = new TaskRunner(this.config, filesetName);
		taskRunner.run();
	});
}
TaskRunner.prototype.processFile = function(filepath, root, sub, filename) {
	var status;
	if (!this.fileset.include(filepath) || this.fileset.exclude(filepath)) {
		return;
	}
	for (var i = 0; i < this.tasks.length; i++) {
		if (!this.tasks[i].isMatch(filepath) || !this.tasks[i].isProcessable(filepath)) {
			continue;
		}
		status = this.tasks[i].process(filepath);
		if (!status) {
			return;
		}
	}
}

module.exports = TaskRunner;