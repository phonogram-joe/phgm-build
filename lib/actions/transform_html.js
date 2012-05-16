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

var TransformHtml = action.inherit();

TransformHtml.prototype.processFile = function(filepath) {
	var content,
		parser,
		urls = [],
		assetpath;
	if (path.extname(filepath) !== '.html') {
		return;
	}
	console.log(
		'HTMLを編集します。',
		'Rewriting HTML.',
		filepath
	);
	content = fs.readFileSync(filepath, 'utf8');
	if (this.config.compact_lines) {
		content = content.replace(/((\n|\r|\r\n)\s*)+/g, '\n');
	}
	if (this.config.remove_comments) {
		content = content.replace(/<!--\s*(?!\[if)[^>]{3}[^>]*-->/g, '');
	}
	if (this.config.rewrite_urls) {
		parser = new htmlparser.Parser({
			onopentag: function(tagname, attrs) {
				if ('href' in attrs) {
					urls.push(attrs['href']);
				}
				if ('src' in attrs) {
					urls.push(attrs['src']);
				}
			}
		});
		parser.write(content);
		parser.done();
		for (var i = 0; i < urls.length; i++) {
			assetpath = urls[i];
			if (/(http:)?\/\//.test(assetpath)) {
				continue;
			} else if (assetpath.indexOf('.') === 0) {
				assetpath = '/' + path.relative(this.workingDir, path.resolve(path.dirname(filepath), assetpath));
			} else if (assetpath.indexOf('/') !== 0) {
				assetpath = '/' + path.join(path.dirname(filepath), assetpath);
			}
			assetpath = assetpath.replace(/\\/g, '/');
			content = content.replace(urls[i], assetpath);
		}
	}
	fs.writeFileSync(filepath, content, 'utf8');
}

module.exports = TransformHtml;