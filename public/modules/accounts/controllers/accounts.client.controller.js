'use strict';

// Accounts controller
angular.module('accounts').controller('AccountsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Accounts',
	function($scope, $stateParams, $location, Authentication, Accounts) {
		$scope.authentication = Authentication;

      //Grid setup
      $scope.$scope = $scope;

      $scope.addInterestItem = function(){
        $scope.account.interests.push({});
      };

      $scope.removeRow = function(row) {
        var index=$scope.account.interests.indexOf(row.entity);
        $scope.account.interests.splice(index, 1);
      };

      var removeTemplate ='<button id="deleteBtn" type="button" class="btn-small" ng-click="getExternalScopes().removeRow(row)">Delete</button> ';


      $scope.gridOptions = {
        data: 'account.interests',
        enableCellEdit: true,
        columnDefs: [{
          field: 'rate',
          width: 60
        },
        {
          field: 'date',
          cellFilter: 'date:\'yyyy-MM-dd\''
        },
        {
          field: 'remove',
          displayName:'',
          cellTemplate: removeTemplate,
          width: 60,
          enableCellEdit:false
        }]
      };


		// Create new Account
		$scope.create = function() {

			// Create new Account object
			var account = new Accounts ({
				name: this.name,
                desc: this.desc,
                interests: []
			});

            //Store interest:
            var interest = {
              rate: this.rate,
              date: this.date
            };

            account.interests.push(interest);




			// Redirect after save
			account.$save(function(response) {
				$location.path('accounts/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Account
		$scope.remove = function(account) {
			if ( account ) { 
				account.$remove();

				for (var i in $scope.accounts) {
					if ($scope.accounts [i] === account) {
						$scope.accounts.splice(i, 1);
					}
				}
			} else {
				$scope.account.$remove(function() {
					$location.path('accounts');
				});
			}
		};

		// Update existing Account
		$scope.update = function() {
			var account = $scope.account;

            //Store interest should probably be optional:
            //account.interests.push({rate:$scope.interest.rate,date:$scope.interest.date});
            /*if(typeof account.interests === 'undefined'){
              account.interests = [];
            }

            account.interests.push({
              rate: 1,
              date: Date.now()
            });*/
            //account.interests.push({interest: this.interest, date:this.interestDate});

			account.$update(function() {
				$location.path('accounts/' + account._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Accounts
		$scope.find = function() {
			$scope.accounts = Accounts.query();
		};

		// Find existing Account
		$scope.findOne = function() {
			$scope.account = Accounts.get({ 
				accountId: $stateParams.accountId
			});
		};
	}
]);