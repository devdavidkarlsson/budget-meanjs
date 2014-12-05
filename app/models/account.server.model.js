'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


/**
 *
 * Interest Rate Schema
 */
var InterestRate = new Schema({
  interest:{
    type: Number,
    default: 0,
    trim: true
  },
  date:{
  type   : Date,
  default: '',
  required: 'When is the interest to be updated',
  trim: true
  }

});

/**
 * Account Schema
 */
var AccountSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Account name',
		trim: true
    },
    desc:{
      type: String,
      default: '',
      trim: true
    },
    interests:
        [{ type : Schema.Types.ObjectId, ref: 'InterestRate' }],
    amount:{
      type: Number,
      default:0,
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

mongoose.model('Account', AccountSchema);