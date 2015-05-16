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
      required: 'Please provide a maximum budget amount that can be consumed in the category per month.',
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
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Category', CategorySchema);