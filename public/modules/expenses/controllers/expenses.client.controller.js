'use strict';

// Expenses controller
angular.module('expenses').controller('ExpensesController', ['$scope','$filter', '$stateParams', '$location', 'Authentication', 'Expenses','Accounts','Categories',
  function($scope,$filter, $stateParams, $location, Authentication, Expenses, Accounts, Categories) {
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
        fromAccount: this.fromAccount._id,
        category: this.category._id
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
        fromAccount: expense.fromAccount,
        category: expense.category,
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
      $scope.findCategories();


    };

    // Find existing Expense
    $scope.findOne = function() {
      $scope.findAccounts();
      $scope.findCategories();

      var that = this;
      Expenses.get({
        expenseId: $stateParams.expenseId
      }).$promise.then(function(expense){
            //Customize data to enable toggle recurrence:
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
    };

    // Find a list of Accounts
    $scope.findAccounts = function() {
      $scope.accounts = Accounts.query();
    };

    // Find a list of Categories
    $scope.findCategories = function() {
      $scope.categories = Categories.query();
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