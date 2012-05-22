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
	_.str = require('underscore.string');
var action = require('./action');
var file = require('../utils/file');

_.templateSettings = {
	interpolate : /\{\{(.+?)\}\}/g
};

var Template = action.inherit();

Template.prototype.init = function(app) {
	this.config.renamePattern = 'rename' in this.config ? _.template(this.config.rename) : null;
	this.config.replaceChar = 'replace' in this.config ? this.config.replace : '-';
	this.config.layout = 'layout' in this.config ? this.config.layout : null;
}

Template.prototype.processFile = function(filepath) {
	var metadata,
		renameMetadata,
		templateMetadata,
		stat,
		time,
		layout,
		content,
		fileDest = null;
	if (this.fileChanges.isSourcePath(filepath)) {
		return;
	}
	metadata = this.fileChanges.getData(this.fileChanges.getSourcePath(filepath), 'metadata');
	if (!metadata) {
		return;
	}
	stat = fs.statSync(filepath);
	//	allow optionally setting a specific time in the file metadata in place of file creating time.
	time = 'time' in metadata ? new Date(metadata.time) : stat.ctime;
	console.log(time);
	//	either use the layout specified in the file metadata or the default layout as a backup.
	layout = 'layout' in metadata ? metadata.layout : this.config.layout;
	layout = path.join(this.workingDir, layout);

	this.logger.info({
		ja: 'ファイル内容をテンプレートに包む。',
		en: 'Wrapping file contents in template.',
		path: filepath,
	});

	//	config may specify a pattern with which to rename files based on metadata
	if (this.config.renamePattern) {
		//	merge the metadata and then attributes about the source file itself
		renameMetadata = _.extend({}, metadata, {
			//	file name based
			dirname: path.dirname(filepath),
			filename: path.basename(filepath),
			basename: path.basename(filepath, path.extname(filepath)),
			extname: path.extname(filepath),
			//	the 'date' of the file, either from file ctime or metadata time.
			yyyy: _.str.pad(time.getFullYear(), 4, '0'),
			mm: _.str.pad(time.getMonth() + 1, 2, '0'),
			dd: _.str.pad(time.getDate(), 2, '0'),
			//	if title present, also add a lowercase version
			title_lc: 'title' in metadata ? metadata.title.toLowerCase() : ''
		});
		//	trim the new file name and then replace invalid characters
		fileDest = _.str.trim(this.config.renamePattern(renameMetadata));
		fileDest = fileDest.replace(/[^-_\\\/\.a-zA-Z0-9]+/g, this.config.replaceChar);
		//	determine the full path of the renamed file
		if (path.dirname(fileDest) === '.') {
			//	if the rename pattern does not specify a directory (eg is filename only)
			//	then use the dirname of the original file.
			fileDest = path.join(path.dirname(filepath), fileDest);
		} else {
			//	otherwise, use path relative to working directory
			fileDest = path.join(this.workingDir, fileDest);
		}
	}
	fileDest = fileDest ? fileDest : filepath;

	//	register that the source html has been moved (if same, no effect)
	this.fileChanges.moveFile(filepath, fileDest);
	//	layout is clearly not a content file, prevent it from being copied to output.
	this.fileChanges.deleteFile(layout);

	//	perform the templating passing the metadata, content, and final path
	content = fs.readFileSync(filepath, 'utf8');
	layout = fs.readFileSync(layout, 'utf8');
	templateMetadata = _.extend({}, metadata, {
		content: content,
		path: path.relative(this.workingDir, fileDest)
	});
	content = _.template(layout)(templateMetadata);

	//	write the final result
	file.mkdir(path.dirname(fileDest));
	fs.writeFileSync(fileDest, content, 'utf8');
}

module.exports = Template;	