#!/usr/bin/env node
var program = require('commander'),
	commands = require('../lib/command_loader');

program
	.version('0.0.1');
	//.option('-C, --chdir <path>', 'change the working directory')
	//.option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
	//.option('-T, --no-tests', 'ignore test hook');

program
	.command('*')
	.description('不明なコマンド')
	.action(function(command){
		console.error('不明ななコマンドです。使い方を見るには--helpオプションを付ける。');
		console.error('Unknown command. To see usage information add the --help option.');
		console.error('"' + command + '"');
		console.error('FAIL');
		process.exit(1);
	});

commands.initCommands(program);

program.parse(process.argv);
