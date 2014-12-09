'use strict';

// Accounts controller
angular.module('accounts').controller('AccountsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Accounts','Expenses','Incomes',
  function($scope, $stateParams, $location, Authentication, Accounts, Expenses, Incomes) {
    $scope.authentication = Authentication;
    var removeTemplate ='<button id="deleteBtn" type="button" class="btn-small" ng-click="getExternalScopes().removeRow(row)">Delete</button> ';


    //Grid setup
    $scope.$scope = $scope;

    $scope.addInterestItem = function(){
      $scope.account.interests.push({});
    };

    $scope.removeRow = function(row) {
      var index=$scope.account.interests.indexOf(row.entity);
      $scope.account.interests.splice(index, 1);
    };



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


    //Find an existing Account and it's corresponding cashflows
    $scope.calculateOne = function(){
      var accountId= $stateParams.accountId;
      $scope.findOne();

      $scope.cashflows= [];
      Incomes.query().$promise.then(function(allIncomes){
        allIncomes.forEach(
            function(income){
              if(income.account===accountId){
                $scope.cashflows.push(income);
              }

            });
      });

      Expenses.query().$promise.then(function(allExpenses){
        allExpenses.forEach(
            function(expense){
              if(expense.account===accountId){
                expense.amount=-expense.amount;
                $scope.cashflows.push(expense);
              }

            });

        $scope.sumCashflows = 0;
        $scope.cashflows.forEach(function(flow) {
          $scope.sumCashflows += Number(flow.amount);
        });


      });


    };

  }
]);