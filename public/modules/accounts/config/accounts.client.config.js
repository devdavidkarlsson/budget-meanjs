'use strict';

// Configuring the Articles module
angular.module('accounts').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Accounts', 'accounts', 'dropdown', '/accounts(/create)?');
		Menus.addSubMenuItem('topbar', 'accounts', 'List Accounts', 'accounts');
		Menus.addSubMenuItem('topbar', 'accounts', 'New Account', 'accounts/create');
	}
]);