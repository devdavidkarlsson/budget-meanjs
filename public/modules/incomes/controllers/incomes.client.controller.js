'use strict';

// Incomes controller
angular.module('incomes').controller('IncomesController', ['$scope', '$filter', '$stateParams', '$location', 'Authentication', 'Incomes','Expenses', 'Accounts',
  function($scope, $filter, $stateParams, $location, Authentication, Incomes, Expenses, Accounts) {
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
        toAccount: this.account._id
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

      var income = this.income;

      var updatedIncome = new Incomes ({
        name: income.name,
        amount: income.amount,
        date: income.date,
        monthly: income.recurring==='monthly',
        yearly: income.recurring==='yearly',
        toAccount: income.account,
        _id: income._id
      });

      updatedIncome.$update(function() {
        $location.path('incomes/' + updatedIncome._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Incomes
    $scope.find = function() {
      $scope.incomes = Incomes.query();
      $scope.findAccounts();
    };

    // Find existing Income
    $scope.findOne = function() {
      var that=this;
      Incomes.get({
        incomeId: $stateParams.incomeId
      }).$promise.then(function(income){



            var recurringVar;
            if(income.monthly===true){
              recurringVar = 'monthly';
            } else if( income.yearly===true){
              recurringVar = 'yearly';
            }
            income.date= new Date(income.date);
            income.recurring=recurringVar;
            that.income=income;
          });


      $scope.findAccounts();
    };




    // Find a list of Accounts
    $scope.findAccounts = function() {
      $scope.accounts = Accounts.query();

    };



    // Find a account from the list of Accounts
    $scope.findAccountById = function(accountId) {
        console.log('called filter' + JSON.stringify($scope.accounts));
      console.log('accID:'+ accountId);
        var found = $filter('findBy')($scope.accounts, accountId);
        console.log(found);
        return (found);
    };



  }
]);