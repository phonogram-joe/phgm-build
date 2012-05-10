var fs = require('fs');
var path = require('path');
var config = require('./config');
var builder = require('./builder');

var commands = module.exports = {
	initCommands: function(program) {
		var filelist = fs.readdirSync(builder.commandsRoot);
		this.program = program;
		filelist.forEach(function(filepath) {
			var command = require(path.join(builder.commandsRoot, filepath));
			command(program, config);
		});
	}
}