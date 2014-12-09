'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Expense = mongoose.model('Expense'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, expense;

/**
 * Expense routes tests
 */
describe('Expense CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Expense
		user.save(function() {
			expense = {
				name: 'Expense Name'
			};

			done();
		});
	});

	it('should be able to save Expense instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Expense
				agent.post('/expenses')
					.send(expense)
					.expect(200)
					.end(function(expenseSaveErr, expenseSaveRes) {
						// Handle Expense save error
						if (expenseSaveErr) done(expenseSaveErr);

						// Get a list of Expenses
						agent.get('/expenses')
							.end(function(expensesGetErr, expensesGetRes) {
								// Handle Expense save error
								if (expensesGetErr) done(expensesGetErr);

								// Get Expenses list
								var expenses = expensesGetRes.body;

								// Set assertions
								(expenses[0].user._id).should.equal(userId);
								(expenses[0].name).should.match('Expense Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Expense instance if not logged in', function(done) {
		agent.post('/expenses')
			.send(expense)
			.expect(401)
			.end(function(expenseSaveErr, expenseSaveRes) {
				// Call the assertion callback
				done(expenseSaveErr);
			});
	});

	it('should not be able to save Expense instance if no name is provided', function(done) {
		// Invalidate name field
		expense.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Expense
				agent.post('/expenses')
					.send(expense)
					.expect(400)
					.end(function(expenseSaveErr, expenseSaveRes) {
						// Set message assertion
						(expenseSaveRes.body.message).should.match('Please fill Expense name');
						
						// Handle Expense save error
						done(expenseSaveErr);
					});
			});
	});

	it('should be able to update Expense instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Expense
				agent.post('/expenses')
					.send(expense)
					.expect(200)
					.end(function(expenseSaveErr, expenseSaveRes) {
						// Handle Expense save error
						if (expenseSaveErr) done(expenseSaveErr);

						// Update Expense name
						expense.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Expense
						agent.put('/expenses/' + expenseSaveRes.body._id)
							.send(expense)
							.expect(200)
							.end(function(expenseUpdateErr, expenseUpdateRes) {
								// Handle Expense update error
								if (expenseUpdateErr) done(expenseUpdateErr);

								// Set assertions
								(expenseUpdateRes.body._id).should.equal(expenseSaveRes.body._id);
								(expenseUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Expenses if not signed in', function(done) {
		// Create new Expense model instance
		var expenseObj = new Expense(expense);

		// Save the Expense
		expenseObj.save(function() {
			// Request Expenses
			request(app).get('/expenses')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Expense if not signed in', function(done) {
		// Create new Expense model instance
		var expenseObj = new Expense(expense);

		// Save the Expense
		expenseObj.save(function() {
			request(app).get('/expenses/' + expenseObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', expense.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Expense instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Expense
				agent.post('/expenses')
					.send(expense)
					.expect(200)
					.end(function(expenseSaveErr, expenseSaveRes) {
						// Handle Expense save error
						if (expenseSaveErr) done(expenseSaveErr);

						// Delete existing Expense
						agent.delete('/expenses/' + expenseSaveRes.body._id)
							.send(expense)
							.expect(200)
							.end(function(expenseDeleteErr, expenseDeleteRes) {
								// Handle Expense error error
								if (expenseDeleteErr) done(expenseDeleteErr);

								// Set assertions
								(expenseDeleteRes.body._id).should.equal(expenseSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Expense instance if not signed in', function(done) {
		// Set Expense user 
		expense.user = user;

		// Create new Expense model instance
		var expenseObj = new Expense(expense);

		// Save the Expense
		expenseObj.save(function() {
			// Try deleting Expense
			request(app).delete('/expenses/' + expenseObj._id)
			.expect(401)
			.end(function(expenseDeleteErr, expenseDeleteRes) {
				// Set message assertion
				(expenseDeleteRes.body.message).should.match('User is not logged in');

				// Handle Expense error error
				done(expenseDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Expense.remove().exec();
		done();
	});
});