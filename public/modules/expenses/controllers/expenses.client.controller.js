'use strict';

// Expenses controller
angular.module('expenses').controller('ExpensesController', ['$scope','$filter', '$stateParams', '$location', 'Authentication', 'Expenses','Accounts',
  function($scope,$filter, $stateParams, $location, Authentication, Expenses, Accounts) {
    $scope.authentication = Authentication;

    // Create new Expense
    $scope.create = function() {
      // Create new Expense object
      var expense = new Expenses ({
        name: this.name,
        amount: this.amount,
        date: this.date,
        monthly: this.recurring==='monthly',
        yearly: this.recurring==='yearly',
        fromAccount: this.account._id
      });

      // Redirect after save
      expense.$save(function(response) {
        $location.path('expenses/' + response._id);

        // Clear form fields
        $scope.name = '';
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Expense
    $scope.remove = function(expense) {
      if ( expense ) {
        expense.$remove();

        for (var i in $scope.expenses) {
          if ($scope.expenses [i] === expense) {
            $scope.expenses.splice(i, 1);
          }
        }
      } else {
        $scope.expense.$remove(function() {
          $location.path('expenses');
        });
      }
    };

    // Update existing Expense
    $scope.update = function() {
      var expense = $scope.expense;

      var updatedExpense = new Expenses({
        name: expense.name,
        amount: expense.amount,
        date: expense.date,
        monthly: expense.recurring==='monthly',
        yearly: expense.recurring==='yearly',
        fromAccount: expense.account,
        _id: expense._id});

      updatedExpense.$update(function() {
        $location.path('expenses/' + updatedExpense._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Expenses
    $scope.find = function() {
      $scope.expenses = Expenses.query();
      console.log($scope.expenses);
      $scope.findAccounts();

    };

    // Find existing Expense
    $scope.findOne = function() {
      var that = this;
      Expenses.get({
        expenseId: $stateParams.expenseId
      }).$promise.then(function(expense){

            var recurringVar;
            if(expense.monthly===true){
              recurringVar = 'monthly';
            } else if( expense.yearly===true){
              recurringVar = 'yearly';
            }

            expense.date = new Date(expense.date);
            expense.recurring = recurringVar;
            that.expense=expense;

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