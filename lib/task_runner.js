/*
 * phgm-build
 * https://github.com/phonogram-joe/phgm-build
 *
 * Copyright (c) 2012 Joseph C. Savona
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var file = require('./utils/file');
var app = require('./app');
var builder = require('./builder');
var FileChanges = require('./utils/paths_delta');
var logger = require('./utils/logger').getLogger();

var TaskRunnerAsync = function(taskConfig) {
	var i,
		actionName,
		taskName,
		actionClass,
		actionConfig;
	this.config = taskConfig;
	this.fileChanges = new FileChanges();
	this.workingDir = null;
	this.callback = null;
	this.logger = null;

	this.actions = [];
	this.currentAction = null;
	this.nextTaskIndex = -1;

	for (i = 0; i < this.config.length; i++) {
		actionConfig = this.config[i];
		if ('action' in actionConfig) {
			actionName = actionConfig.action;
			actionClass = builder.getAction(actionName);
			if (!actionClass) {
				logger.error({
					ja: 'アクションが見つかりません。', 
					en: 'Action not found.', 
					actionName: actionName
				});
				process.exit(1);
			}
		} else if ('task' in actionConfig) {
			taskName = actionConfig.task;
			actionConfig = app.config.tasks[actionConfig.task];
			actionConfig.taskName = taskName;
			actionClass = TaskRunnerAsync;
		} else {
			logger.error({
				ja: 'アクションかタスクのどちらかを指定してください。',
				en: 'Please specify a task or action.',
				config: actionConfig
			});
			process.exit(1);
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

TaskRunnerAsync.prototype.initAction = function() {}
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

TaskRunnerAsync.prototype.setLogger = function(logger) {
	this.logger = logger;
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
		if ('action' in this.currentAction.config) {
			logger.notice({
				ja: '"{{action}}" アクションを実行します。',
				en: 'Executing "{{action}}" action.',
				action: this.currentAction.config.action,
				dir: this.workingDir,
				config: this.currentAction.config
			});
		} else {
			logger.notice({
				ja: '"{{task}}" タスクを実行します。',
				en: 'Executing "{{task}}" sub-task.',
				task: this.currentAction.config.taskName
			});
		}
		this.currentAction.setLogger(logger);
		this.currentAction.setWorkingDir(this.workingDir);
		this.currentAction.setCallback(TaskRunnerAsync.generateCallback(_.bind(this._next, this)));
		this.currentAction.setFileChanges(this.fileChanges);
		this.currentAction.initAction(app);
		this.currentAction.process();
	} else {
		_.isFunction(this.callback) ? this.callback() : this.callback.next();
	}
}

module.exports = TaskRunnerAsync;