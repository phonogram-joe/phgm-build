/*
 * phgm-build
 * https://github.com/phonogram-joe/phgm-build
 *
 * Copyright (c) 2012 Joseph C. Savona
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var action = require('./action');
var file = require('../utils/file');
var _ = require('underscore');

var Server = action.inherit();

Server.prototype.init = function(app) {
	this.config.port = 'port' in this.config ? parseInt(this.config.port, 10) : 8080;
	this.config.host = 'host' in this.config ? this.config.localhost : 'localhost';
	this.config.expires = 'expires' in this.config ? this.config.expires : 2592000000; //30 days
	this.server = http.createServer(_.bind(this.request, this));
	this.start = new Date();
}

Server.prototype.process = function() {
	this.server.listen(this.config.port, this.config.host);
}

Server.prototype.request = function(request, response) {
	var uri,
		filepath,
		stream,
		self = this;
	uri = url.parse(request.url);
	filepath = path.join(this.workingDir, /\/$/.test(uri.pathname) ? uri.pathname + 'index.html' : uri.pathname);
	this.logger.info({
		ja: 'HTTPアクセス {{url}}',
		en: 'HTTP access {{url}}',
		url: request.url,
		filepath: filepath
	});
	path.exists(filepath, function(exists) {
		//	return error for files outside of root and non-existent files
		if (!exists 
			|| file.isSubDirectory(filepath, self.workingDir))
		{
			return self.returnError(filepath, response);
		}
		fs.stat(filepath, function(err, stats) {
			var expiresAt,
				mimeType,
				charset
			//	return error if stats cannot be retrieved
			//	or if path is not a regular file
			if (err 
				|| !stats.isFile())
			{
				self.returnError(filepath, response);
			}
			//	file metadata
			mimeType = Server.contentTypes[path.extname(filepath).substr(1)];
			charset = mimeType in Server.charsets ? Server.charsets[mimeType].toLowerCase() : null
			expiresAt = new Date();
			expiresAt.setTime(self.start.getTime() + self.config.expires);

			stream = fs.createReadStream(filepath);
			response.writeHead(200, {
				'Content-length': stats.size
				, 'Content-type': mimeType + (charset ? '; charset=' + charset : '')
				, 'Cache-control': 'max-age=' + self.config.expires + ', public'
				, 'Expires': expiresAt.toUTCString()
				, 'Last-Modified': self.start.toUTCString()
			});
			stream.pipe(response);
		});
	});
}
Server.prototype.returnError = function(filepath, response) {
	response.writeHead(404, {'Content-type': 'text/plain'});
	response.write('File not accessible.\n');
	response.write(filepath);
	response.end();
}

Server.contentTypes = {
	"aiff": "audio/x-aiff",
	"arj": "application/x-arj-compressed",
	"asf": "video/x-ms-asf",
	"asx": "video/x-ms-asx",
	"au": "audio/ulaw",
	"avi": "video/x-msvideo",
	"bcpio": "application/x-bcpio",
	"ccad": "application/clariscad",
	"cod": "application/vnd.rim.cod",
	"com": "application/x-msdos-program",
	"cpio": "application/x-cpio",
	"cpt": "application/mac-compactpro",
	"csh": "application/x-csh",
	"css": "text/css",
	"cur": "image/vnd.microsoft.icon",
	"deb": "application/x-debian-package",
	"dl": "video/dl",
	"doc": "application/msword",
	"drw": "application/drafting",
	"dvi": "application/x-dvi",
	"dwg": "application/acad",
	"dxf": "application/dxf",
	"dxr": "application/x-director",
	"etx": "text/x-setext",
	"ez": "application/andrew-inset",
	"fli": "video/x-fli",
	"flv": "video/x-flv",
	"gif": "image/gif",
	"gl": "video/gl",
	"gtar": "application/x-gtar",
	"gz": "application/x-gzip",
	"hdf": "application/x-hdf",
	"hqx": "application/mac-binhex40",
	"htm": "text/html",
	"html": "text/html",
	"ice": "x-conference/x-cooltalk",
	"ico": "image/x-icon",
	"ief": "image/ief",
	"igs": "model/iges",
	"ips": "application/x-ipscript",
	"ipx": "application/x-ipix",
	"jad": "text/vnd.sun.j2me.app-descriptor",
	"jar": "application/java-archive",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	"js": "text/javascript",
	"json": "application/json",
	"latex": "application/x-latex",
	"lsp": "application/x-lisp",
	"lzh": "application/octet-stream",
	"m": "text/plain",
	"m3u": "audio/x-mpegurl",
	"man": "application/x-troff-man",
	"manifest": "text/cache-manifest",
	"me": "application/x-troff-me",
	"midi": "audio/midi",
	"mif": "application/x-mif",
	"mime": "www/mime",
	"movie": "video/x-sgi-movie",
	"mp4": "video/mp4",
	"mpg": "video/mpeg",
	"mpga": "audio/mpeg",
	"ms": "application/x-troff-ms",
	"nc": "application/x-netcdf",
	"oda": "application/oda",
	"ogm": "application/ogg",
	"pbm": "image/x-portable-bitmap",
	"pdf": "application/pdf",
	"pgm": "image/x-portable-graymap",
	"pgn": "application/x-chess-pgn",
	"pgp": "application/pgp",
	"pm": "application/x-perl",
	"png": "image/png",
	"pnm": "image/x-portable-anymap",
	"ppm": "image/x-portable-pixmap",
	"ppz": "application/vnd.ms-powerpoint",
	"pre": "application/x-freelance",
	"prt": "application/pro_eng",
	"ps": "application/postscript",
	"qt": "video/quicktime",
	"ra": "audio/x-realaudio",
	"rar": "application/x-rar-compressed",
	"ras": "image/x-cmu-raster",
	"rgb": "image/x-rgb",
	"rm": "audio/x-pn-realaudio",
	"rpm": "audio/x-pn-realaudio-plugin",
	"rtf": "text/rtf",
	"rtx": "text/richtext",
	"scm": "application/x-lotusscreencam",
	"set": "application/set",
	"sgml": "text/sgml",
	"sh": "application/x-sh",
	"shar": "application/x-shar",
	"silo": "model/mesh",
	"sit": "application/x-stuffit",
	"skt": "application/x-koan",
	"smil": "application/smil",
	"snd": "audio/basic",
	"sol": "application/solids",
	"spl": "application/x-futuresplash",
	"src": "application/x-wais-source",
	"stl": "application/SLA",
	"stp": "application/STEP",
	"sv4cpio": "application/x-sv4cpio",
	"sv4crc": "application/x-sv4crc",
	"svg": "image/svg+xml",
	"swf": "application/x-shockwave-flash",
	"tar": "application/x-tar",
	"tcl": "application/x-tcl",
	"tex": "application/x-tex",
	"texinfo": "application/x-texinfo",
	"tgz": "application/x-tar-gz",
	"tiff": "image/tiff",
	"tr": "application/x-troff",
	"tsi": "audio/TSP-audio",
	"tsp": "application/dsptype",
	"tsv": "text/tab-separated-values",
	"txt": "text/plain",
	"unv": "application/i-deas",
	"ustar": "application/x-ustar",
	"vcd": "application/x-cdlink",
	"vda": "application/vda",
	"vivo": "video/vnd.vivo",
	"vrm": "x-world/x-vrml",
	"wav": "audio/x-wav",
	"wax": "audio/x-ms-wax",
	"wma": "audio/x-ms-wma",
	"wmv": "video/x-ms-wmv",
	"wmx": "video/x-ms-wmx",
	"woff": "application/x-font-woff",
	"wrl": "model/vrml",
	"wvx": "video/x-ms-wvx",
	"xbm": "image/x-xbitmap",
	"xlw": "application/vnd.ms-excel",
	"xml": "text/xml",
	"xpm": "image/x-xpixmap",
	"xwd": "image/x-xwindowdump",
	"xyz": "chemical/x-pdb",
	"zip": "application/zip"
};

Server.charsets = {
	'text/javascript': 'UTF-8',
	'text/css': 'UTF-8',
	'text/html': 'UTF-8',
	'application/json': 'UTF-8'
};

module.exports = Server;