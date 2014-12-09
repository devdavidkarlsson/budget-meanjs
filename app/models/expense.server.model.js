'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Expense Schema
 */
var ExpenseSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Expense name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Expense', ExpenseSchema);