'use strict';

//Incomes service used to communicate Incomes REST endpoints
angular.module('incomes').factory('Incomes', ['$resource',
	function($resource) {
		return $resource('incomes/:incomeId', { incomeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);