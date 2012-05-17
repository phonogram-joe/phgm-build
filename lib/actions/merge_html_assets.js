/*
 * phgm-build
 * https://github.com/phonogram-joe/phgm-build
 *
 * Copyright (c) 2012 Joseph C. Savona
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
var path = require('path');
var fs = require('fs');
var htmlparser = require('htmlparser2');
var _ = require('underscore');
var action = require('./action');
var file = require('../utils/file');

var FLAGS = {
	script: 'script',
	style: 'style',
	other: '__other__'
}

var MergeHtmlAssets = action.inherit();

MergeHtmlAssets.prototype.init = function(app) {
	this.filesets = {};
	this.separator_class = 'separator_class' in this.config ? this.config.separator_class : null;
}

MergeHtmlAssets.prototype.process = function() {
	this.processAll(this.workingDir);
	this.mergeFiles();
	this.callback.next();
}

MergeHtmlAssets.prototype.processFile = function(filepath) {
	var scripts = [],
		styles = [],
		current,
		parser,
		content,
		filesetKeys = [],
		self = this,
		flush;
	if (path.extname(filepath) !== '.html') {
		return;
	}
	console.log(
		'HTMLファイルを解析してJavaScriptとCSSをマージする。',
		'Analyzing HTML to merge scripts and styles.',
		filepath
	);
	flush = function() {
		current = FLAGS.other;
		if (scripts.length > 1) {
			scripts.unshift(FLAGS.script);
			filesetKeys.push(self.registerFileset.apply(self, scripts));
		}
		if (scripts.length > 0) {
			scripts = [];
		}
		if (styles.length > 1) {
			styles.unshift(FLAGS.style);
			filesetKeys.push(self.registerFileset.apply(self, styles));
		}
		if (styles.length > 0) {
			styles = [];
		}
	};
	current = FLAGS.other;
	parser = new htmlparser.Parser({
		onopentag: function(tagname, attrs) {
			if (self.separator_class 
				&& 'class' in attrs 
				&& (new RegExp('\\b' + self.separator_class + '\\b')).test(attrs['class'])) 
			{
				//	if the tag has the 'separator_class' within @class attribute,
				//	force-flush the previous scripts/styles to start a new group.
				flush();
			}
			if (tagname === 'script') {
				if (!('src' in attrs)) {
					flush();
				} else if (/^http(s)?:/.test(attrs['src'])) {
					flush();
				} else {
					scripts.push(attrs['src']);
				}
			} else if (tagname === 'link') {
				if (!('href' in attrs)) {
					//	no reference to a file - not a stylesheet
					flush();
				} else if ('rel' in attrs 
					&& attrs['rel'].indexOf('stylesheet') < 0)
				{
					//	not a stylesheet
					flush();
				} else if (/^http(s)?:/.test(attrs['href'])) {
					//	absolute paths could reference external files,
					//	do not merge them
					flush();
				} else if ('media' in attrs
					&& /and/.test(attrs['media']))
				{
					//	media queries are not always active, therefore have to keep separate
					flush();
				} else {
					//	a non-media query, site-relative stylesheet. merge it!
					styles.push(attrs['href']);
				}
			} else {
				flush();
			}
		},
		onclosetag: function(tagname) {
			if (tagname === 'head' || tagname === 'body') {
				flush();
			}
		}
	});
	content = fs.readFileSync(filepath, 'utf8');
	parser.write(content);
	parser.done();
	content = this.replaceWithMerged(content, filesetKeys);
	fs.writeFileSync(filepath, content, 'utf8');
}

MergeHtmlAssets.prototype.replaceWithMerged = function(content, filesetKeys) {
	var self = this,
		filesetIndex,
		fileIndex,
		mergePath,
		key,
		files,
		oldPath,
		newPath,
		type;
	for (filesetIndex = 0; filesetIndex < filesetKeys.length; filesetIndex++) {
		key = filesetKeys[filesetIndex];
		mergePath = this.filesets[key][0];
		mergePath = mergePath.replace(/\\/g, '/');
		type = this.filesets[key][1];
		files = this.filesets[key].slice(2);
		for (fileIndex = 0; fileIndex < files.length; fileIndex++) {
			if (type === FLAGS.script) {
				content = content.replace(new RegExp('((\n|\r|\r\n)\s*)?<script[^>]*' + files[fileIndex] + '[^>]*>\s*</script>'), fileIndex === 0 ? '<script src="/' + mergePath + '"></script>' : '');
			} else if (type === FLAGS.style) {
				content = content.replace(new RegExp('((\n|\r|\r\n)\s*)?<link[^>]*' + files[fileIndex] + '[^>]*>'), fileIndex === 0 ? '<link rel="stylesheet" href="/' + mergePath + '" />' : '');
			}	
		}
	}
	if (this.config.less_to_css) {
		content = content.replace(/<link([^>]*)stylesheet\/less/g, '<link$1stylesheet');
	}
	return content;
}

MergeHtmlAssets.prototype.mergeFiles = function() {
	var self = this,
		changes = {};
	console.log('MergeHtmlAssets filesets:');
	console.log(this.filesets);
	_.each(this.filesets, function(files, filesetKey) {
		var mergePath = path.join(self.workingDir, files[0]),
			type = files[1],
			files = files.slice(2),
			content = '';
		files.forEach(function(file) {
			var oldPath,
				newPath;
			oldPath = path.join(
				self.workingDir,
				file
			);
			oldPath = self.fileChanges.getFinalPath(oldPath);
			newPath = path.join(
				self.workingDir,
				mergePath
			);
			console.log('merging files ', oldPath, mergePath);
			content += '/* ' + path.basename(oldPath) + ' */\n';
			content += fs.readFileSync(oldPath, 'utf8');
			content += '\n';
			changes[oldPath] = mergePath;
		});
		fs.writeFileSync(mergePath, content, 'utf8');
	});
	/*
	_.each(changes, function(newPath, oldPath) {
		self.fileChanges.moveFile(oldPath, newPath);
	});
	*/
}

MergeHtmlAssets.prototype.registerFileset = function(type) {
	var key,
		files,
		name;
	files = _.toArray(arguments);
	key = files.slice(0).sort().join('|');
	if (key.length <= 0) {
		return null;
	}
	if (key in this.filesets) {
		return key;
	}
	if (type === FLAGS.script) {
		files.unshift(path.join(this.config.script_dir, _.uniqueId('scripts_') + '-' + (new Date()).getTime() + '.js'));
	} else if (type === FLAGS.style) {
		files.unshift(path.join(this.config.style_dir, _.uniqueId('styles_') + '-' + (new Date()).getTime() + '.css'));
	}
	console.log('fileset:: ', files);
	this.filesets[key] = files;
	return key;
}

module.exports = MergeHtmlAssets;