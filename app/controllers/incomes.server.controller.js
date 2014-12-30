'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Income = mongoose.model('Income'),
	_ = require('lodash');

/**
 * Create a Income
 */
exports.create = function(req, res) {
	var income = new Income(req.body);
	income.user = req.user;

	income.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(income);
		}
	});
};

/**
 * Show the current Income
 */
exports.read = function(req, res) {
	res.jsonp(req.income);
};

/**
 * Update a Income
 */
exports.update = function(req, res) {
	var income = req.income ;

	income = _.extend(income , req.body);

	income.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(income);
		}
	});
};

/**
 * Delete an Income
 */
exports.delete = function(req, res) {
	var income = req.income ;

	income.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(income);
		}
	});
};

/**
 * List of Incomes
 */
exports.list = function(req, res) { 
	Income.find({user: req.user}).sort('-created').populate('user', 'displayName').exec(function(err, incomes) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(incomes);
		}
	});
};

/**
 * Income middleware
 */
exports.incomeByID = function(req, res, next, id) { 
	Income.findById(id).populate('user', 'displayName').exec(function(err, income) {
		if (err) return next(err);
		if (! income) return next(new Error('Failed to load Income ' + id));
		req.income = income ;
		next();
	});
};

/**
 * Income authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.income.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
