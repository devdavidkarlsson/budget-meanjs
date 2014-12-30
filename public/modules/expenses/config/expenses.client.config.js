'use strict';

// Configuring the Articles module
angular.module('expenses').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Expenses', 'expenses', 'dropdown', '/expenses(/create)?');
      //Where should i put this so it is guaranteed that it exists when all modules are configured
      Menus.addMenuItem('topbar', 'Transactions', 'transactions', 'dropdown');
      Menus.addSubMenuItem('topbar', 'transactions', 'List Expenses', 'expenses');
	  Menus.addSubMenuItem('topbar', 'transactions', 'New Expense', 'expenses/create');
	}
]);