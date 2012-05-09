//based on file.js from https://github.com/cowboy/grunt
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

// The module to be exported.
var file = module.exports = {};

// External libs.
file.glob = require('glob-whatev');

// Change the current base path (ie, CWD) to the specified path.
file.setBase = function() {
	var dirpath = path.join.apply(path, arguments);
	process.chdir(dirpath);
};

// Match a filepath against one or more wildcard patterns. Returns true if
// any of the patterns match.
file.isMatch = function(patterns, filepath) {
	patterns = Array.isArray(patterns) ? patterns : [patterns];
	return patterns.some(function(pattern) {
		return file.glob.minimatch(filepath, pattern, {matchBase: true});
	});
};

// Return an array of all file paths that match the given wildcard patterns.
file.expand = function() {
	var args = _.toArray(arguments);
	// If the first argument is an options object, save those options to pass
	// into the file.glob.glob method for minimatch to use.
	var options = _.isObject(args[0]) ? args.shift() : {};
	// Use the first argument if it's an Array, otherwise convert the arguments
	// object to an array and use that.
	var patterns = Array.isArray(args[0]) ? args[0] : args;
	// Generate a should-be-unique number.
	var uid = +new Date();
	// Return a flattened, uniqued array of matching file paths.
	return _(patterns)
		.chain()
		.flatten()
		.map(function(pattern) {
			return file.glob.glob(pattern, options);
		})
		.flatten()
		.uniq(false)
		.value();
};

// Further filter file.expand.
function expandByType(type) {
	var args = _.toArray(arguments).slice(1);
	return file.expand.apply(file, args).filter(function(filepath) {
		try {
			return fs.statSync(filepath)[type]();
		} catch(e) {
			//TODO
		}
	});
}

// A few type-specific file expansion methods.
file.expandDirs = expandByType.bind(file, 'isDirectory');
file.expandFiles = expandByType.bind(file, 'isFile');

// Return an array of all file paths that match the given wildcard patterns,
// plus any URLs that were passed at the end.
file.expandFileURLs = function() {
	// Use the first argument if it's an Array, otherwise convert the arguments
	// object to an array and use that.
	var patterns = Array.isArray(arguments[0]) ? arguments[0] : _.toArray(arguments);
	var urls = [];
	// Filter all URLs out of patterns list and store them in a separate array.
	patterns = patterns.filter(function(pattern) {
		if (/^(?:file|https?):\/\//i.test(pattern)) {
			// Push onto urls array.
			urls.push(pattern);
			// Remove from patterns array.
			return false;
		}
		// Otherwise, keep pattern.
		return true;
	});
	// Return expanded filepaths with urls at end.
	return file.expandFiles(patterns).map(function(filepath) {
		var abspath = path.resolve(filepath);
		// Convert C:\foo\bar style paths to /C:/foo/bar.
		if (abspath.indexOf('/') !== 0) {
			abspath = ('/' + abspath).replace(/\\/g, '/');
		}
		return 'file://' + abspath;
	}).concat(urls);
};

// Like mkdir -p. Create a directory and any intermediary directories.
file.mkdir = function(dirpath) {
	dirpath.split(/[\/\\]/).reduce(function(parts, part) {
		parts += part + '/';
		var subpath = path.resolve(parts);
		if (!path.existsSync(subpath)) {
			try {
				fs.mkdirSync(subpath, '0755');
			} catch(e) {
				throw new Error('Unable to create directory "' + subpath + '" (Error code: ' + e.code + ').', e);
			}
		}
		return parts;
	}, '');
};

// Recurse into a directory, executing callback for each file.
file.recurse = function recurse(rootdir, callback, subdir) {
	var abspath = subdir ? path.join(rootdir, subdir) : rootdir;
	fs.readdirSync(abspath).forEach(function(filename) {
		var filepath = path.join(abspath, filename);
		if (fs.statSync(filepath).isDirectory()) {
			recurse(rootdir, callback, path.join(subdir, filename));
		} else {
			callback(path.join(rootdir, subdir, filename), rootdir, subdir, filename);
		}
	});
};

// Is a given file path absolute?
file.isPathAbsolute = function() {
	var filepath = path.join.apply(path, arguments);
	return path.resolve(filepath) === filepath;
};

// Write a file.
file.write = function(filepath, contents) {
	// Create path, if necessary.
	file.mkdir(path.dirname(filepath));
	try {
		// Actually write file.
		fs.writeFileSync(filepath, contents);
		return true;
	} catch(e) {
		throw new Error('Unable to write "' + filepath + '" file (Error code: ' + e.code + ').', e);
	}
};

// Read a file, return its contents.
file.read = function(filepath, encoding) {
	var src;
	try {
		src = fs.readFileSync(String(filepath), encoding ? null : 'utf8');
		return src;
	} catch(e) {
		throw new Error('Unable to read "' + filepath + '" file (Error code: ' + e.code + ').', e);
	}
};

// Read a file, optionally processing its content, then write the output.
file.copy = function(srcpath, destpath, options) {
	if (!options) { options = {}; }
	var src = file.read(srcpath, true);
	if (options.process && options.noProcess !== true &&
		!(options.noProcess && file.isMatch(options.noProcess, srcpath))) {
		try {
			src = options.process(src.toString('utf8'));
		} catch(e) {
			throw new Error('Error while processing "' + srcpath + '" file.', e);
		}
	}
	// Abort copy if the process function returns false.
	if (src === false) {
		throw new Error('Error while processing "' + srcpath + '" file.');
	} else {
		file.write(destpath, src);
	}
};

// Read a file, parse its contents, return an object.
file.readJSON = function(filepath) {
	var src = this.read(String(filepath));
	var result;
	try {
		result = JSON.parse(src);
		return result;
	} catch(e) {
		console.error(src);
		throw new Error('Error parsing JSON at "' + filepath + '".', e);
	}
};
