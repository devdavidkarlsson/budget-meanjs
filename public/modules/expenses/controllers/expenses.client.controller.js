'use strict';

// Expenses controller
angular.module('expenses').controller('ExpensesController', ['$scope','$filter', '$stateParams', '$location', '$modal', 'Authentication', 'Expenses','Accounts','Categories','$state',
  function($scope,$filter, $stateParams, $location, $modal, Authentication, Expenses, Accounts, Categories, $state) {
    $scope.authentication = Authentication;



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
      //$scope.expense = Expenses.get({expenseId: $stateParams.expenseId});


      var that = this;
      Expenses.get({
        expenseId: $stateParams.expenseId
      }).$promise.then(function(expense){
            //Customize data to enable toggle recurrence:
            var recurringVar;
            if(expense.monthly === true){
              recurringVar = 'monthly';
            } else if( expense.yearly === true){
              recurringVar = 'yearly';
            }else{
              recurringVar = 'not recurring';
            }
            expense.date = new Date(expense.date);
            expense.amount = Number(expense.amount);
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


    //Modal:
    function openModal(items){
      $modal.open({
        templateUrl: 'modules/expenses/views/create-expense.client.view.html',
        controller: 'ExpenseCreateController',
        size:  'md',
        resolve: {
          items: items
        }
      });
    }

    $scope.showEditModal= function(expense, $event, doApplyFilter){
      var callback = function(){};
      if(doApplyFilter === true){
        callback = applyFilter;
      }

      $scope.findAccounts();
      $scope.findCategories();

      openModal(function () { return {accounts: $scope.accounts ,categories: $scope.categories, expense: expense, heading:'Edit Expense', method: 'update', callback: callback} });
      $event.preventDefault();
    }

    function findCategoriesAndAccounts(){
      if(!$scope.categories)
        $scope.findCategories();
      if(!$scope.accounts)
        $scope.findAccounts();
    }

      function setUpModals(){

      if($state.current.name=='createExpense'){
        findCategoriesAndAccounts();
        openModal(function () { return {accounts: $scope.accounts ,categories: $scope.categories, expense: null, heading:'New Expense', method: 'new'} });
      }
      else if( $state.current.name=='editExpense'){
        findCategoriesAndAccounts();
        $scope.findOne();

        openModal(function () { return {accounts: $scope.accounts, categories: $scope.categories, expense: $scope.expense, heading:'Edit Expense', method: 'update'} });
      }
    }

    setUpModals();

  }
]);