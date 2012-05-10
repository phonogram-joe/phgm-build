var fs = require('fs');
var path = require('path');
var app = require('./app');
var builder = require('./builder');

var commands = module.exports = {
	initCommands: function(program) {
		var filelist = fs.readdirSync(builder.commandsRoot);
		this.program = program;
		filelist.forEach(function(filepath) {
			var command;
			if (filepath === '.' || filepath === '..') {
				return;
			}
			command = require(path.join(builder.commandsRoot, filepath));
			command(program, app);
		});
	}
}