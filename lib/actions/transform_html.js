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
	_.str = require('underscore.string');
var action = require('./action');
var file = require('../utils/file');
var Url = require('../utils/url');

var FLAGS = {
	script: 'script',
	style: 'style',
	other: '__other__'
}

var TransformHtml = action.inherit();

TransformHtml.prototype.processFile = function(filepath) {
	var content,
		removeClasses,
		parser,
		urls = [],
		assetpath;
	if (path.extname(filepath) !== '.html') {
		return;
	}
	this.logger.info({
		ja: 'HTMLを編集します。',
		en: 'Rewriting HTML.',
		path: filepath
	});
	content = fs.readFileSync(filepath, 'utf8');
	if (this.config.remove_classes) {
		removeClasses = this.config.remove_classes.split(/\s+/);
		for (var i = 0; i < removeClasses.length; i++) {
			content = content.replace(new RegExp('<[^<>]+"[^"<>]*'+removeClasses[i]+'[^"<>]*"[^<>]*>\\s*<\\s*\\/[a-zA-Z]+\\s*>', 'mg'), '');
		}
	}
	if (this.config.compact_lines) {
		content = content.replace(/((\n|\r|\r\n)\s*)+/g, '\n');
	}
	if (this.config.remove_comments) {
		content = content.replace(/<!--\s*(?!\[if)[^>]{3}[^>]*-->/g, '');
	}
	if (this.config.rewrite_urls) {
		parser = new htmlparser.Parser({
			onopentag: function(tagname, attrs) {
				for (var prop in attrs) {
					if (!attrs.hasOwnProperty(prop) 
						|| !attrs[prop])
					{
						continue;
					}
					//	if it looks vaguely URL-ish, try resolving it
					if (Url.isUrl(attrs[prop])
						&& Url.hasFile(attrs[prop]))
					{
						urls.push(attrs[prop]);
					}
				}
			}
			//, onerror: function(error) {}
		});
		parser.write(content);
		parser.done();
		for (var i = 0; i < urls.length; i++) {
			assetpath = Url.resolveUrl(urls[i], this.fileChanges, filepath, this.workingDir);
			content = content.replace('="'+urls[i]+'"', '="'+assetpath+'"');
		}
	}
	fs.writeFileSync(filepath, content, 'utf8');
}

module.exports = TransformHtml;