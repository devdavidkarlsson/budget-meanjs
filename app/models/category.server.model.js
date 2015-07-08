'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Category Schema
 */
var CategorySchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Category name',
		trim: true
	},
    amount:{
      type: Number,
      required: 'Please provide a maximum budget amount that can be consumed in the category per period.',
      trim: true
    },
	created: {
		type: Date,
		default: Date.now
	},
    period: {
      type: String,
      default: '',
      required: 'Please fill whether budget is monthly or yearly',
      trim: true
    },
    recalc: {
      type: Boolean,
      default: true,
      required: 'Please specify if the category should recalculate to apply on monthly, repsective yearly basis',
      trim: true
    },
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Category', CategorySchema);