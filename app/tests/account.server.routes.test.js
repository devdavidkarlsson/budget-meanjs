'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Account = mongoose.model('Account'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, account;

/**
 * Account routes tests
 */
describe('Account CRUD tests', function() {
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

		// Save a user to the test db and create new Account
		user.save(function() {
			account = {
				name: 'Account Name'
			};

			done();
		});
	});

	it('should be able to save Account instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Account
				agent.post('/accounts')
					.send(account)
					.expect(200)
					.end(function(accountSaveErr, accountSaveRes) {
						// Handle Account save error
						if (accountSaveErr) done(accountSaveErr);

						// Get a list of Accounts
						agent.get('/accounts')
							.end(function(accountsGetErr, accountsGetRes) {
								// Handle Account save error
								if (accountsGetErr) done(accountsGetErr);

								// Get Accounts list
								var accounts = accountsGetRes.body;

								// Set assertions
								(accounts[0].user._id).should.equal(userId);
								(accounts[0].name).should.match('Account Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Account instance if not logged in', function(done) {
		agent.post('/accounts')
			.send(account)
			.expect(401)
			.end(function(accountSaveErr, accountSaveRes) {
				// Call the assertion callback
				done(accountSaveErr);
			});
	});

	it('should not be able to save Account instance if no name is provided', function(done) {
		// Invalidate name field
		account.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Account
				agent.post('/accounts')
					.send(account)
					.expect(400)
					.end(function(accountSaveErr, accountSaveRes) {
						// Set message assertion
						(accountSaveRes.body.message).should.match('Please fill Account name');
						
						// Handle Account save error
						done(accountSaveErr);
					});
			});
	});

	it('should be able to update Account instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Account
				agent.post('/accounts')
					.send(account)
					.expect(200)
					.end(function(accountSaveErr, accountSaveRes) {
						// Handle Account save error
						if (accountSaveErr) done(accountSaveErr);

						// Update Account name
						account.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Account
						agent.put('/accounts/' + accountSaveRes.body._id)
							.send(account)
							.expect(200)
							.end(function(accountUpdateErr, accountUpdateRes) {
								// Handle Account update error
								if (accountUpdateErr) done(accountUpdateErr);

								// Set assertions
								(accountUpdateRes.body._id).should.equal(accountSaveRes.body._id);
								(accountUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Accounts if not signed in', function(done) {
		// Create new Account model instance
		var accountObj = new Account(account);

		// Save the Account
		accountObj.save(function() {
			// Request Accounts
			request(app).get('/accounts')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Account if not signed in', function(done) {
		// Create new Account model instance
		var accountObj = new Account(account);

		// Save the Account
		accountObj.save(function() {
			request(app).get('/accounts/' + accountObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', account.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Account instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Account
				agent.post('/accounts')
					.send(account)
					.expect(200)
					.end(function(accountSaveErr, accountSaveRes) {
						// Handle Account save error
						if (accountSaveErr) done(accountSaveErr);

						// Delete existing Account
						agent.delete('/accounts/' + accountSaveRes.body._id)
							.send(account)
							.expect(200)
							.end(function(accountDeleteErr, accountDeleteRes) {
								// Handle Account error error
								if (accountDeleteErr) done(accountDeleteErr);

								// Set assertions
								(accountDeleteRes.body._id).should.equal(accountSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Account instance if not signed in', function(done) {
		// Set Account user 
		account.user = user;

		// Create new Account model instance
		var accountObj = new Account(account);

		// Save the Account
		accountObj.save(function() {
			// Try deleting Account
			request(app).delete('/accounts/' + accountObj._id)
			.expect(401)
			.end(function(accountDeleteErr, accountDeleteRes) {
				// Set message assertion
				(accountDeleteRes.body.message).should.match('User is not logged in');

				// Handle Account error error
				done(accountDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Account.remove().exec();
		done();
	});
});