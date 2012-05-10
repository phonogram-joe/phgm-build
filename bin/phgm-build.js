#!/usr/bin/env node
var program = require('commander'),
	commands = require('../lib/commands');

program
	.version('0.0.1');
	//.option('-C, --chdir <path>', 'change the working directory')
	//.option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
	//.option('-T, --no-tests', 'ignore test hook');

program
	.command('*')
	.description('不明なコマンド')
	.action(function(command){
		console.log('「' + command + '」は不明なコマンドです。');
	});

commands.initCommands(program);

program.parse(process.argv);
