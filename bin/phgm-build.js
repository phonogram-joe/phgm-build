#!/usr/bin/env node
var program = require('commander'),
	fs = require('fs'),
	_ = require('underscore'),
	path = require('path'),
	file = require('../lib/file'),
	tasks = require('../lib/tasks'),
	configPath = path.join(process.cwd(), 'phgm-build.json'),
	builderRoot = path.dirname(path.dirname(process.argv[1]));

var error = function(message) {
	console.error();
	console.error(message);
	console.error('FAIL');
	process.exit(1);
}

program
	.version('0.0.1');
	//.option('-C, --chdir <path>', 'change the working directory')
	//.option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
	//.option('-T, --no-tests', 'ignore test hook');

program
	.command('setup')
	.description('サイトの初期化を行う。（設定ファイル作成）')
	.action(function(){
		var configTemplatePath;
		if (path.existsSync(configPath)) {
			console.log('設定ファイルは既に作られています。');
			console.log(configPath);
			console.log('OK');
			process.exit(0);
		}
		configTemplatePath = path.join(builderRoot, 'templates', 'config.json');
		console.log('設定ファイルを作成します。')
		file.copy(configTemplatePath, configPath);
		console.log(configPath);
		console.log('OK');
	});

program
	.command('build <env>')
	.description('環境別の設定によりサイト・ビルドを行う。')
	.action(function(env){
		var config = file.readJSON(configPath),
			source = path.join(process.cwd(), config.root),
			dest = path.join(process.cwd(), config.publish),
			html;
		if (path.existsSync(dest)) {
			console.log('ビルド先を削除します。');
			fs.rmdirSync(dest);
			console.log('OK');
		}

		console.log('ビルド先を作成します。');
		file.mkdir(dest);
		console.log('OK');

		html = file.expand(path.join(source, '**/*.html'));
		_(html).each(function(htmlSrc) {
			var relative = path.relative(source, htmlSrc),
				htmlDest = path.resolve(dest, relative);
			console.log('copy "' + htmlSrc + '" to "' + htmlDest + '".');
			file.mkdir(path.dirname(htmlDest));
			file.copy(htmlSrc, htmlDest);
			console.log('OK');
		});
	});

program
	.command('*')
	.description('不明なコマンド')
	.action(function(command){
		console.log('「' + command + '」は不明なコマンドです。');
	});

program.parse(process.argv);
