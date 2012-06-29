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
var path.file = require('../utils/file');
var _ = require('underscore');

var FileModel = function(filepath) {
	this.srcPath = filepath;
	this.newPath = filepath;
	this.__stat = null;
	this.__content = null;
	this.metaData = {};
	this.newContent = null;
	this.isUnlink = false;
	this.fsBuffer = [];
	this.isFlushed = false;
}

FileModel.prototype = {
	constructor: FileModel

	/*
	 *	FileModel#move(newPath)
	 *		Move the file to the given path.
	 *
	 *	newPath: string representing the path to move to.
	 */
	, rename: function(newPath) {
		this.newPath = newPath;
	}

	/*
	 *	FileModel#unlink
	 *		Unlink (delete) the file. Bypasses further processing.
	 */
	, unlink: function() {
		this.isUnlink = true;
	}

	/*
	 *	FileModel#content([data])
	 *		Get the contents of the file (no arguments) or set them
	 *		(pass <data> argument).
	 *
	 *	data: optional. if present, file contents are set to this value.
	 */
	, content: function() {
		if (arguments.length === 1) {
			this.__content = this.newContent = arguments[0];
			return;
		}

		if (this.__content) {
			return this.__content;
		}

		return this.__content = fs.readFileModelSync(this.srcPath);
	}

	/*
	 *	FileModel#data(key[, value])
	 *		Set/get metadata about the file - sole purpose is
	 *		for passing arbitrary data about a file to later
	 *		<Processor>s.
	 *
	 *	key: string, key of the metadata.
	 *	value: optional. can be any data type.
	 *
	 *	If value is present, metadata for <key> is set to <value>
	 *	Otherwise the current <key> is returned (or null if not
	 *	set).
	 */
	, data: function(key) {
		if (arguments.length === 2) {
			this.metadata[key] = arguments[1];
		}
		return (key in this.metadata) ? this.metadata[key] : null;
	}

	/*
	 *	FileModel#stat
	 *		Get an <fs.Stats> object for the source file.
	 */
	, stat: function() {
		if (this.stat) {
			return this.stat;
		}

		return this.stat = fs.statSync(this.srcPath);
	}

	/*
	 *	FileModel#fs(command[, **args])
	 *		Execute an arbitrary command from the 'fs' module against
	 *		the final output file. The command will not be run until
	 *		all processing is complete and the final content is written
	 *		to disk.
	 *
	 *	command: first arg is the name of the method in the 'fs' module 
	 *		to call, eg 'utimes' or 'rename'
	 *	**args: remaining arguments are used as the 2nd+ arguments to the
	 *		<command>. first argument is the path itself.	
	 */
	, fs: function() {
		var args = _.toArray(arguments);
		this.fsBuffer.push(args);
	}

	/*
	 *	FileModel#flush
	 *		Write the changes to the file to disk. Renames if necessary, outputs
	 *		contents if they have changed, and then runs any 'fs' commands
	 *		on the final output file (if given through <FileModel#fs(...)>).
	 *
	 *		Beware: if <FileModel#unlink()> has been called, the source path is deleted.
	 */
	, flush: function() {
		var args
			, command
			;

		if (this.isFlushed) {
			throw new Exception('models.FileModel#flush(): changes to ' + this.srcPath + ' already flushed.');
		}

		//	if unlinking, remove the source file and return
		if (this.isUnlink) {
			if (path.existsSync(this.srcPath)) {
				//TODO: 
				//fs.unlinkSync(this.srcPath);
				console.log('fs.unlinkSync(' + this.srcPath + ');');
			}
			return;
		}

		//	create the output dir and file
		path.file.mkdir(path.dirname(this.newPath));
		if (this.newContent) {
			fs.writeFileModelSync(this.newPath, this.newContent, 'utf8');
		} else if (this.srcPath !== this.newPath) {
			fs.renameSync(this.srcPath, this.newPath);	
		}

		//	run all specified fs commands against the file
		for (var i = 0; i < this.fsBuffer.length; i++) {
			args = this.fsBuffer[i];
			command = args.shift();
			args.unshift(this.newPath);

			if (!/Sync$/.test(command)) {
				command += 'Sync';
			}
			fs[command].apply(fs, args);
		}
	}
}

module.exports = FileModel;