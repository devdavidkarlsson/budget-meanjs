'use strict';

//Setting up route
angular.module('incomes').config(['$stateProvider',
	function($stateProvider) {
		// Incomes state routing
		$stateProvider.
		state('listIncomes', {
			url: '/incomes',
			templateUrl: 'modules/incomes/views/list-incomes.client.view.html'
		}).
		state('createIncome', {
			url: '/incomes/create',
			templateUrl: 'modules/incomes/views/create-income.client.view.html'
		}).
		state('viewIncome', {
			url: '/incomes/:incomeId',
			templateUrl: 'modules/incomes/views/view-income.client.view.html'
		}).
		state('editIncome', {
			url: '/incomes/:incomeId/edit',
			templateUrl: 'modules/incomes/views/edit-income.client.view.html'
		});
	}
]);