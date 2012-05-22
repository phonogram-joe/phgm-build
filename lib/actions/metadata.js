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
var action = require('./action');
var file = require('../utils/file');

var Metadata = action.inherit();

Metadata.prototype.init = function(app) {
	this.extensions = 'extensions' in this.config ? this.config.extensions : [];
	this.extensions = _(this.extensions)
		.chain()
		.flatten()
		.map(function(ext) {
			return ext.indexOf('.') === 0 ? ext : '.' + ext;
		})
		.value();
}

Metadata.prototype.processFile = function(filepath) {
	var content,
		metadataMatch,
		metadataStart,
		metadataEnd,
		metadata;
	if (this.extensions.indexOf(path.extname(filepath)) < 0) {
		return;
	}

	this.logger.info({
		ja: 'ファイル・メタデータを読込中。',
		en: 'Reading file metadata.',
		path: filepath,
	});

	content = fs.readFileSync(filepath, 'utf8');
	metadataMatch = /^\s*([\-\#][\-\#][\-\#]+) ?(\w*)\s*/.exec(content);
	if (!metadataMatch) {
		return;
	}
	metadataStart = metadataMatch[0].length;
	metadataEnd = content.indexOf(metadataMatch[1], metadataMatch[0].length);
	metadata = content.substring(metadataStart, metadataEnd);
	content = content.substring(metadataEnd + metadataMatch[1].length);

	fs.writeFileSync(filepath, content, 'utf8');
	metadata = JSON.parse(JSON.minify(metadata));
	this.fileChanges.setData(filepath, 'metadata', metadata);

}

module.exports = Metadata;