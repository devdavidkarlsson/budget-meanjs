'use strict';

// Incomes controller
angular.module('incomes').controller('IncomesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Incomes', 'Accounts',
	function($scope, $stateParams, $location, Authentication, Incomes, Accounts) {
		$scope.authentication = Authentication;


		// Create new Income
		$scope.create = function() {
			// Create new Income object

			var income = new Incomes ({
				name: this.name,
                amount: this.amount,
                date: this.date,
                monthly: this.recurring==='monthly',
                yearly: this.recurring==='yearly',
                account: this.account._id
			});

			// Redirect after save
			income.$save(function(response) {
				$location.path('incomes/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Income
		$scope.remove = function(income) {
			if ( income ) { 
				income.$remove();

				for (var i in $scope.incomes) {
					if ($scope.incomes [i] === income) {
						$scope.incomes.splice(i, 1);
					}
				}
			} else {
				$scope.income.$remove(function() {
					$location.path('incomes');
				});
			}
		};

		// Update existing Income
		$scope.update = function() {
			var income = $scope.income;

			income.$update(function() {
				$location.path('incomes/' + income._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Incomes
		$scope.find = function() {
			$scope.incomes = Incomes.query();
		};

		// Find existing Income
		$scope.findOne = function() {
			$scope.income = Incomes.get({
				incomeId: $stateParams.incomeId
        });


         $scope.findAccounts();
        };




      // Find a list of Accounts
      $scope.findAccounts = function() {
        $scope.accounts = Accounts.query();
      };



    }
]);