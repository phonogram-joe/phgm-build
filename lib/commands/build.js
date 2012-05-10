var path = require('path');
var fs = require('fs');
var file = require('../utils/file');
var _ = require('underscore');

module.exports = function(program, configObject) {
	program
		.command('build <fileset>')
		.description('指定のファイル・グループをビルドする。')
		.action(function(env){
			var config = configObject.load(),
				source = path.join(process.cwd(), config.paths.source),
				dest = path.join(process.cwd(), config.paths.publish),
				html;
				
			if (path.existsSync(dest)) {
				console.log('ビルド先を一旦削除します。');
				console.log(dest);
				fs.rmdirSync(dest);
				console.log('OK');
			}

			console.log('ビルド先を作成します。');
			console.log(dest);
			file.mkdir(dest);
			console.log('OK');

			html = file.expand(path.join(source, '**/*.html'));
			_(html).each(function(htmlSrc) {
				var relative = path.relative(source, htmlSrc),
					htmlDest = path.resolve(dest, relative);
				console.log('copy "' + relative + '" to "' + dest + '".');
				file.mkdir(path.dirname(htmlDest));
				file.copy(htmlSrc, htmlDest);
				console.log('OK');
			});
		});
}