'use strict';

// Configuring the Articles module
angular.module('incomes').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Incomes', 'incomes', 'dropdown', '/incomes(/create)?');
      Menus.addSubMenuItem('topbar', 'transactions', 'List Incomes', 'incomes');
		Menus.addSubMenuItem('topbar', 'transactions', 'New Income', 'incomes/create');
	}
]);