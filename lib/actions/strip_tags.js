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

var StripTags = action.inherit();

StripTags.prototype.init = function(app) {
	this.config.tags = 'tags' in this.config ? this.config.tags : [
		'b', 
		'blockquote', 
		'code', 
		'dd', 
		'dt', 
		'dl', 
		'em', 
		'h1', 
		'h2', 
		'h3', 
		'h4', 
		'h5', 
		'h6', 
		'i', 
		'kbd', 
		'li', 
		'ol', 
		'p', 
		'pre', 
		'sub', 
		'sup', 
		'strong', 
		'strike', 
		'ul',
		'div',
		'span',
		'article',
		'aside',
		'details',
		'figcaption',
		'figure',
		'footer',
		'header',
		'hgroup',
		'nav',
		'section'
	];
	this.config.attrs = 'attrs' in this.config ? this.config.attrs : [
		'id', 
		'class', 
		'rel', 
		'name', 
		'alt', 
		'title', 
		'width', 
		'height',
	];
	this.config.selfClosing = ['br', 'hr', 'img', 'input'];
	this.config.allowImgs = 'allow_images' in this.config && this.config.allow_images === 'true' ? true : false;
	if (this.config.allowImgs) {
		this.config.tags.push('img');
	}
	this.config.allowLinks = 'allow_links' in this.config && this.config.allow_links === 'true' ? true : false;
	if (this.config.allowLinks) {
		this.config.tags.push('a');
	}
}

StripTags.prototype.processFile = function(filepath) {
	var content,
		output,
		isSafe,
		parser,
		self = this;
	if (path.extname(filepath) !== '.html') {
		return;
	}

	this.logger.info({
		ja: 'HTMLの危機タグを削除します。',
		en: 'Removing unsafe HTML tags.',
		path: filepath
	});
	content = fs.readFileSync(filepath, 'utf8');
	output = '';
	isSafe = false;

	parser = new htmlparser.Parser({
		onopentag: function(tagname, attrs) {
			tagname = tagname.toLowerCase();
			if (this.config.tags.indexOf(tagname) < 0) {
				isSafe = false;
				return;
			}
			if (tagname === 'a' && !this.config.allowLinks) {
				return;
			}
			if (tagname === 'img' && !this.config.allowImgs) {
				return;
			}
			//TODO: add logic to properly handle links and images
			output = '<' + tagname;
			_.each(attrs, function(value, attr) {
				attr = attr.toLowerCase();
				if (self.config.attrs.indexOf(attr) < 0) {
					return;
				}
				if (/^\s*javascript\s*:/.test(value)) {
					return;
				}
				if (/^\s*http(s)?\s*:/.test(value)) {
					return;
				}
				output += ' ' + attr + '="' + value + '"';
			});
			if (this.config.selfClosing.indexOf(tagname) >= 0) {
				output += '/>';
			} else {
				output += '>';
			}
		},
		ontext: function(text) {
			if (!isSafe) {
				return;
			}
			text = _.str.stripTags(text);
			text = _.str.unescapeHTML(text);
			text = _.str.escapeHTML(text);
			output += text;
		},
		onclosetag: function(tagname) {
			if (!isSafe) {
				return;
			}
			if (this.config.selfClosing.indexOf(tagname) >= 0) {
				return;
			}
			output += '</' + tagname.toLowerCase() + '>';
		}
	});
	parser.write(content);
	parser.done();

	fs.writeFileSync(filepath, output, 'utf8');
}

module.exports = StripTags;	