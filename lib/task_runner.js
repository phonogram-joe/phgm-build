var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var file = require('./utils/file');
var app = require('./app');
var builder = require('./builder');
var FileChanges = require('./utils/paths_delta');


var TaskRunnerAsync = function(taskConfig) {
	var i,
		actionName,
		actionClass,
		actionConfig;
	this.taskConfig = taskConfig;
	this.fileChanges = new FileChanges();
	this.workingDir = null;
	this.callback = null;

	this.actions = [];
	this.currentAction = null;
	this.nextTaskIndex = -1;

	for (i = 0; i < this.taskConfig.length; i++) {
		actionName = this.taskConfig[i].action;
		actionConfig = this.taskConfig[i];
		if (actionName === 'task') {
			actionConfig = app.config.tasks[actionConfig.task];
			actionClass = TaskRunnerAsync;
		} else {
			actionClass = builder.getAction(this.taskConfig[i].action);
		}
		this.actions.push(new actionClass(actionConfig));
	}
}

TaskRunnerAsync.generateCallback = function(callback) {
	return {
		count: 1
		, next: function() {
			this.count--;
			if (this.count <= 0) {
				callback();
			}
		}
		, wait: function() {
			this.count++;
		}
	};
}

TaskRunnerAsync.prototype.init = function() {}

TaskRunnerAsync.prototype.getWorkingDir = function() {
	return this.workingDir;
}

TaskRunnerAsync.prototype.setWorkingDir = function(workingDir) {
	this.workingDir = workingDir;
}

TaskRunnerAsync.prototype.getFileChanges = function() {
	return this.fileChanges;
}

TaskRunnerAsync.prototype.setFileChanges = function(fileChanges) {
	this.fileChanges = fileChanges;
}

TaskRunnerAsync.prototype.setCallback = function(callback) {
	this.callback = callback;
}

TaskRunnerAsync.prototype.process = function() {
	if (this.nextTaskIndex >= 0) {
		builder.fail(
			'既にタスクを実行しています。'
			, 'Already executing tasks'
		);
	}
	if (arguments.length === 1) {
		this.callback = arguments[0];
	}
	this._next();
}

TaskRunnerAsync.prototype._next = function() {
	this.nextTaskIndex++;
	if (this.currentAction) {
		this.workingDir = this.currentAction.getWorkingDir();
	}
	if (this.nextTaskIndex < this.actions.length) {
		//	if not first action, set the working directory to that of the previous action
		//	advance to the next action, set its working dir, initialize it, and process
		this.currentAction = this.actions[this.nextTaskIndex];
		this.currentAction.setWorkingDir(this.workingDir);
		this.currentAction.setCallback(TaskRunnerAsync.generateCallback(_.bind(this._next, this)));
		this.currentAction.setFileChanges(this.fileChanges);
		this.currentAction.init(app);
		this.currentAction.process();
	} else {
		_.isFunction(this.callback) ? this.callback() : this.callback.next();
	}
}

module.exports = TaskRunnerAsync;