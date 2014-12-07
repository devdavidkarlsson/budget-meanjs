'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Income = mongoose.model('Income'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, income;

/**
 * Income routes tests
 */
describe('Income CRUD tests', function() {
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

		// Save a user to the test db and create new Income
		user.save(function() {
			income = {
				name: 'Income Name'
			};

			done();
		});
	});

	it('should be able to save Income instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Income
				agent.post('/incomes')
					.send(income)
					.expect(200)
					.end(function(incomeSaveErr, incomeSaveRes) {
						// Handle Income save error
						if (incomeSaveErr) done(incomeSaveErr);

						// Get a list of Incomes
						agent.get('/incomes')
							.end(function(incomesGetErr, incomesGetRes) {
								// Handle Income save error
								if (incomesGetErr) done(incomesGetErr);

								// Get Incomes list
								var incomes = incomesGetRes.body;

								// Set assertions
								(incomes[0].user._id).should.equal(userId);
								(incomes[0].name).should.match('Income Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Income instance if not logged in', function(done) {
		agent.post('/incomes')
			.send(income)
			.expect(401)
			.end(function(incomeSaveErr, incomeSaveRes) {
				// Call the assertion callback
				done(incomeSaveErr);
			});
	});

	it('should not be able to save Income instance if no name is provided', function(done) {
		// Invalidate name field
		income.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Income
				agent.post('/incomes')
					.send(income)
					.expect(400)
					.end(function(incomeSaveErr, incomeSaveRes) {
						// Set message assertion
						(incomeSaveRes.body.message).should.match('Please fill Income name');
						
						// Handle Income save error
						done(incomeSaveErr);
					});
			});
	});

	it('should be able to update Income instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Income
				agent.post('/incomes')
					.send(income)
					.expect(200)
					.end(function(incomeSaveErr, incomeSaveRes) {
						// Handle Income save error
						if (incomeSaveErr) done(incomeSaveErr);

						// Update Income name
						income.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Income
						agent.put('/incomes/' + incomeSaveRes.body._id)
							.send(income)
							.expect(200)
							.end(function(incomeUpdateErr, incomeUpdateRes) {
								// Handle Income update error
								if (incomeUpdateErr) done(incomeUpdateErr);

								// Set assertions
								(incomeUpdateRes.body._id).should.equal(incomeSaveRes.body._id);
								(incomeUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Incomes if not signed in', function(done) {
		// Create new Income model instance
		var incomeObj = new Income(income);

		// Save the Income
		incomeObj.save(function() {
			// Request Incomes
			request(app).get('/incomes')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Income if not signed in', function(done) {
		// Create new Income model instance
		var incomeObj = new Income(income);

		// Save the Income
		incomeObj.save(function() {
			request(app).get('/incomes/' + incomeObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', income.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Income instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Income
				agent.post('/incomes')
					.send(income)
					.expect(200)
					.end(function(incomeSaveErr, incomeSaveRes) {
						// Handle Income save error
						if (incomeSaveErr) done(incomeSaveErr);

						// Delete existing Income
						agent.delete('/incomes/' + incomeSaveRes.body._id)
							.send(income)
							.expect(200)
							.end(function(incomeDeleteErr, incomeDeleteRes) {
								// Handle Income error error
								if (incomeDeleteErr) done(incomeDeleteErr);

								// Set assertions
								(incomeDeleteRes.body._id).should.equal(incomeSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Income instance if not signed in', function(done) {
		// Set Income user 
		income.user = user;

		// Create new Income model instance
		var incomeObj = new Income(income);

		// Save the Income
		incomeObj.save(function() {
			// Try deleting Income
			request(app).delete('/incomes/' + incomeObj._id)
			.expect(401)
			.end(function(incomeDeleteErr, incomeDeleteRes) {
				// Set message assertion
				(incomeDeleteRes.body.message).should.match('User is not logged in');

				// Handle Income error error
				done(incomeDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Income.remove().exec();
		done();
	});
});