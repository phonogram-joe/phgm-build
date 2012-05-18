/*
 * phgm-build
 * https://github.com/phonogram-joe/phgm-build
 *
 * Copyright (c) 2012 Joseph C. Savona
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
/*!
 * adapted from
 *
 * Log.js
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 *
 * changes:
 * - emit an event on calls to log()
 * - remove 'read' functionality
 * - when a stream is provided, log both to it *and* console. 
 *		separate console.error/log depending on log level.
 * - multi-lingual logging support (japanese and english)
 * - data passing - log calls pass objects, not string, and the non-language specific parts are printed.
 */

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');
var _ = require('underscore');

_.templateSettings = {
	interpolate : /\{\{(.+?)\}\}/g
};

/**
 * Initialize a `Logger` with the given log `level` defaulting
 * to __DEBUG__ and `stream` defaulting to _stdout_.
 * 
 * @param {Number} level 
 * @param {Object} stream 
 * @api public
 */

var Log = exports = module.exports = function Log(level, stream){
	if ('string' == typeof level) level = exports[level.toUpperCase()];
	this.level = level || exports.DEBUG;
	if (stream) {
		this.stream = stream;
		this.isStdout = false;
	} else {
		this.stream = process.stdout;
		this.isStdout = true;
	}
	this.lang = process.env.LANG === exports.JAPANESE ? exports.JAPANESE : exports.ENGLISH;
};

exports.defaultLogger = null;

exports.getLogger = function(level, stream) {
	if (!exports.defaultLogger) {
		if (stream && _.isString(stream)) {
			stream = fs.createWriteStream(stream);
		}
		exports.defaultLogger = new Log(level, stream);
	}
	return exports.defaultLogger;
}

exports.JAPANESE = 'ja';
exports.ENGLISH = 'en';

/**
 * System is unusable.
 * 
 * @type Number
 */

exports.EMERGENCY = 0;

/**
 * Action must be taken immediately.
 * 
 * @type Number 
 */

exports.ALERT = 1;

/**
 * Critical condition.
 *
 * @type Number
 */

exports.CRITICAL = 2;

/**
 * Error condition.
 * 
 * @type Number
 */

exports.ERROR = 3;

/**
 * Warning condition.
 * 
 * @type Number
 */

exports.WARNING = 4;

/**
 * Normal but significant condition.
 * 
 * @type Number
 */

exports.NOTICE = 5;

/**
 * Purely informational message.
 * 
 * @type Number
 */

exports.INFO = 6;

/**
 * Application debug messages.
 * 
 * @type Number
 */

exports.DEBUG = 7;

/**
 * prototype.
 */ 

Log.prototype = {

	setLevel: function(level) {
		this.level = exports[level.toUpperCase()];
	}
	
	/**
	 * Log output message.
	 *
	 * @param  {String} levelStr
	 * @param  {Array} args
	 * @api private
	 */

	, log: function(levelStr, data) {
		if (exports[levelStr] <= this.level) {
			var msg = data[this.lang],
				time = new Date(),
				message;

			msg = _.template(msg)(data);

			message = '[' + time.toISOString() + '] ' + levelStr + ' ' + msg + '\n';

			delete data[exports.JAPANESE];
			delete data[exports.ENGLISH];
			if (!_.isEmpty(data)) {
				message += util.inspect(data, false, 4, false) + '\n';
			} else {
				data = null;
			}
			this.stream.write(message);
			this.emit('logged', {
				level: levelStr,
				message: msg,
				time: time,
				data: data
			});
			if (!this.isStdout) {
				exports[levelStr] <= exports.ERROR ? console.error(message) : console.log(message);
			}
		}
	},

	/**
	 * Log emergency `msg`.
	 *
	 * @param  {String} msg
	 * @api public
	 */

	emergency: function(data){
		this.log('EMERGENCY', data);
		process.exit(1);
	},

	/**
	 * Log alert `msg`.
	 *
	 * @param  {String} msg
	 * @api public
	 */

	alert: function(data){
		this.log('ALERT', data);
	},

	/**
	 * Log critical `msg`.
	 *
	 * @param  {String} msg
	 * @api public
	 */

	critical: function(data){
		this.log('CRITICAL', data);
	},

	/**
	 * Log error `msg`.
	 *
	 * @param  {String} msg
	 * @api public
	 */

	error: function(data){
		this.log('ERROR', data);
	},

	/**
	 * Log warning `msg`.
	 *
	 * @param  {String} msg
	 * @api public
	 */

	warning: function(data){
		this.log('WARNING', data);
	},

	/**
	 * Log notice `msg`.
	 *
	 * @param  {String} msg
	 * @api public
	 */

	notice: function(data){
		this.log('NOTICE', data);
	},

	/**
	 * Log info `msg`.
	 *
	 * @param  {String} msg
	 * @api public
	 */ 

	info: function(data){
		this.log('INFO', data);
	},

	/**
	 * Log debug `msg`.
	 *
	 * @param  {String} msg
	 * @api public
	 */

	debug: function(data){
		this.log('DEBUG', data);
	}
};

/**
 * Inherit from `EventEmitter`.
 */

Log.prototype.__proto__ = EventEmitter.prototype;