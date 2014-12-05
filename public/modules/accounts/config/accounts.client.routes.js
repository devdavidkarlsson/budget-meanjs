'use strict';

//Setting up route
angular.module('accounts').config(['$stateProvider',
	function($stateProvider) {
		// Accounts state routing
		$stateProvider.
		state('listAccounts', {
			url: '/accounts',
			templateUrl: 'modules/accounts/views/list-accounts.client.view.html'
		}).
		state('createAccount', {
			url: '/accounts/create',
			templateUrl: 'modules/accounts/views/create-account.client.view.html'
		}).
		state('viewAccount', {
			url: '/accounts/:accountId',
			templateUrl: 'modules/accounts/views/view-account.client.view.html'
		}).
		state('editAccount', {
			url: '/accounts/:accountId/edit',
			templateUrl: 'modules/accounts/views/edit-account.client.view.html'
		});
	}
]);