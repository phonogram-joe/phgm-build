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
var crypto = require('crypto');
var _ = require('underscore');
var action = require('./action');
var file = require('../utils/file');

var VersionAssets = action.inherit();

VersionAssets.prototype.init = function(app) {
	this.config.keep_original = 'keep_original' in this.config && this.config.keep_original === true ? true : false;
	if (!('extensions' in this.config)) {
		this.config.extensions = [
			'.js', 
			'.css', 

			//	画像
			'.png', 
			'.jpg', 
			'.jpeg', 
			'.gif', 
			'.webp',

			//favicon.icoというアイコン・ファイル名は変えちゃだめなので、バージョン化しない
			//'.ico', 

			//	フォント
			'.otf', 
			'.woff', 
			'.ttf', 
			'.ttc',
			'.eot',
			'.svg', 
			'.svgz', 

			//	IE専用スクリプト・スタイル
			'.htc', 

			//	ビデオ
			'.mp4',
			'.m4v',
			'.ogv',
			'.webm',
			
			//	音
			'.mp3',
			'.oga',
			'.ogg',
			'.m4a'
		];
	}
}

VersionAssets.prototype.processFile = function(filepath) {
	var contents,
		contentCrypto,
		hash,
		versionedPath,
		basename,
		extname;
	extname = path.extname(filepath);
	basename = path.basename(filepath, extname);
	if (!this.fileChanges.isFinalPath(filepath)) {
		return;
	}
	if (this.config.extensions.indexOf(extname) < 0) {
		return;
	}

	//	内容をハッシュする
	contentCrypto = crypto.createHash('sha1');
	contents = fs.readFileSync(filepath);
	contentCrypto.update(contents);

	hash = contentCrypto.digest('hex').substr(0, this.config.hash_length).replace('=', '');
	versionedPath = path.join(
		path.dirname(filepath),
		basename + '.' + hash + extname
	);

	this.logger.info({
		ja: 'インクルード・ファイルをバージョン化する。',
		en: 'Versioning asset file.',
		src: path.relative(this.workingDir, filepath),
		dest: path.relative(this.workingDir, versionedPath)
	});
	fs.writeFileSync(versionedPath, contents);

	this.fileChanges.moveFile(filepath, versionedPath);
	if (this.config.keep_original) {
		this.fileChanges.keepFile(filepath);
	}
}

module.exports = VersionAssets;