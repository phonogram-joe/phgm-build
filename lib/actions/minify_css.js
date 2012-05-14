var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var cleanCSS = require('clean-css');
var action = require('./action');
var file = require('../utils/file');

var MinifyCss = action.inherit();

MinifyCss.prototype.processFile = function(filepath) {
	var source;
	if (path.extname(filepath) !== '.css') {
		return;
	}

	console.log(
		'CSSを圧縮します。',
		'Minifying CSS',
		filepath
	);

	source = fs.readFileSync(filepath, 'utf8');
	source = cleanCSS.process(source);

	fs.writeFileSync(filepath, source, 'utf8');
}

module.exports = MinifyCss;