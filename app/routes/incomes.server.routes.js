'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var incomes = require('../../app/controllers/incomes.server.controller');

	// Incomes Routes
	app.route('/incomes')
		.get(users.requiresLogin, incomes.list)
		.post(users.requiresLogin, incomes.create);

	app.route('/incomes/:incomeId')
		.get(incomes.read)
		.put(users.requiresLogin, incomes.hasAuthorization, incomes.update)
		.delete(users.requiresLogin, incomes.hasAuthorization, incomes.delete);

	// Finish by binding the Income middleware
	app.param('incomeId', incomes.incomeByID);
};
