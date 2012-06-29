/*
 * phgm-build
 * https://github.com/phonogram-joe/phgm-build
 *
 * Copyright (c) 2012 Joseph C. Savona
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

var url = require('url');
var path = require('path');
var trim = require('underscore.string').trim;
//	very general 
var URL_PATTERN = /(https?:)?(\/\/)?[-A-Za-z0-9\+&@#\/%\?=~_\(\)|!:,.;]*[-A-Za-z0-9\+&@#\/%=~_\(\)|]/;
var URL_PATTERN_GLOBAL = new RegExp(URL_PATTERN.source, 'g');
//	protocol relative urls have "//" DOMAIN "/"
var PROTOCOL_RELATIVE_PATTERN = /^\/\/([a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5})\//;
//	files have basename including optional _/-/. separated segments and end in a period and extension
var FILE_PATTERN_PRESENT = /([a-zA-Z0-9]+([-_\.]{1}[a-zA-Z0-9]+)*([\.]{1}[a-zA-Z0-9]+))/;
var FILE_PATTERN_END = new RegExp(FILE_PATTERN_PRESENT.source + '$');

var Url = function(theUrl) {
	var parsed;
	this.theUrl = trim(theUrl);

	parsed = url.parse(this.theUrl);
	this.hostname = parsed.hostname;
	this.pathname = parsed.pathname;
	this.search = parsed.search;

	//	node's URL parser gets confused on protocol relative URLs. 
	//	if no hostname was found, see if the pathname starts with a
	//	protocol relative "//" followed by domain name, and extract
	//	it as the hostname
	if (!this.hostname && PROTOCOL_RELATIVE_PATTERN.test(this.pathname)) {
		this.hostname = this.pathname.replace(PROTOCOL_RELATIVE_PATTERN, '$1');
		this.pathname = this.pathname.replace(PROTOCOL_RELATIVE_PATTERN, '/');
	}
}
Url.prototype.isRootRelativeFilePath = function() {
	return this.isUrl() && this.isFilePath() && !this.isDomainRelative();
}
Url.prototype.isUrl = function() {
	return URL_PATTERN.test(this.theUrl);
}
Url.prototype.isDomainRelative = function() {
	return this.hostname && this.hostname.length > 0;
}
Url.prototype.isRelative = function() {
	return this.pathname && this.pathname.indexOf('/') !== 0;
}
Url.prototype.isFilePath = function() {
	return this.pathname && FILE_PATTERN_END.test(this.pathname);
}
Url.prototype.relativeTo = function(root) {
	var newUrl;
	if (!this.isRelative()) return this.theUrl;

	if (this.pathname.indexOf('/') === 0) {
		newUrl = this.pathname;
	} else if (this.pathname.indexOf('.') === 0) {
		newUrl = path.resolve(path.dirname(root), this.pathname);
	} else {
		newUrl = path.join(path.dirname(root), this.pathname);
	}
	return newUrl;
}

Url.isUrl = function(theUrl) {
	return URL_PATTERN.test(theUrl);
}
Url.resolveFilePath = function(theUrl, fileChanges, filepath, workingDir) {
	return resolveFilePath(theUrl, fileChanges, filepath, workingDir, false);
}
Url.hasFile = function(theUrl) {
	return FILE_PATTERN_PRESENT.test(theUrl);
}

Url.resolveUrl = function(theUrl, fileChanges, filepath, workingDir) {
	var newUrl = resolveFilePath(theUrl, fileChanges, filepath, workingDir, true);
	if (!newUrl) {
		return theUrl;
	}
	newUrl = '/' + path.relative(workingDir, newUrl);
	return newUrl.replace(/\\/g, '/');
}

function resolveFilePath(theUrl, fileChanges, filepath, workingDir, keepSearch) {
	var url = new Url(theUrl)
		, pathname

	//	disregard non-URLs, non-file (eg directory) URLs, and domain-relative URLs
	if (!url.isRootRelativeFilePath()) {
		return null;
	}

	//	assuming that this is a valid root-relative URL,
	//	resolve the file path
	if (url.isRelative()) {
		pathname = url.relativeTo(filepath);
	} else {
		//	otherwise resolve path relative to working directory
		pathname = path.join(workingDir, url.pathname);
	}

	//	disregard if there is no corresponding file
	//	this is critical - the URL regex is very liberal,
	//	here we skip anything not actually a known file
	if (!fileChanges.isKnownPath(pathname)) {
		return null;
	}

	//	url corresponds to known file, work out the
	//	final filename
	return fileChanges.getFinalPath(pathname) + (keepSearch ? (url.search || '') : '');
}

Url.replaceUrls = function(content, callback) {
	return content.replace(URL_PATTERN_GLOBAL, callback);
}

module.exports = Url;