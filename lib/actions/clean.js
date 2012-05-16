/*
 * phgm-build
 * https://github.com/phonogram-joe/phgm-build
 *
 * Copyright (c) 2012 Joseph C. Savona
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
var path = require('path');
var action = require('./action');
var file = require('../utils/file');

var Clean = action.inherit();

Clean.prototype.init = function(app) {
	this.target = app.getPath(this.config.target);
}

Clean.prototype.process = function() {
	file.cleanDir(this.target);
	file.rmdirSync(this.target);
	this.callback.next();
}

module.exports = Clean;