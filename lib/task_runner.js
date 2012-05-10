var fs = require('fs');
var path = require('path');
var app = require('./app');
var builder = require('./builder');
var _ = require('underscore');

var task_classes = {};

(function() {
	var filelist = fs.readdirSync(builder.tasksRoot);
	fileset.forEach(function(filepath) {
		var taskName;
		if (filepath === '.' || filepath === '..') {
			return;
		}
		taskName = path.basename(filepath, path.extname(filepath));
		task_classes[taskName] = require(path.join(builder.tasksRoot, filepath));
	});
});

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
		task.init(config);
		self.tasks.push(task);
	});
}
TaskRunner.prototype.run = function() {
	var self = this;
}
