'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Income Schema
 */
var IncomeSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Income name',
		trim: true
	},
    amount: {
      type: String,
      default: '',
      required: 'Please fill Income amount',
      trim: true
    },
    date: {
        type: Date,
        default: '',
        required: 'Please fill Income date',
        trim: true
    },
    monthly: {
        type: Boolean,
        default: '',
        required: 'Please fill whether income is recurring monthly',
        trim: true
    },
    yearly: {
      type: Boolean,
      default: '',
      required: 'Please fill whether income is recurring yearly',
      trim: true
    },
    account: {
      type: Schema.ObjectId,
      ref: 'Account',
      required: 'Please select account'

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

mongoose.model('Income', IncomeSchema);