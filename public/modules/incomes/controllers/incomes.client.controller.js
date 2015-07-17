'use strict';

// Incomes controller
angular.module('incomes').controller('IncomesController', ['$scope', '$filter', '$stateParams', '$state',  '$location', '$modal', 'Authentication', 'Incomes','Expenses', 'Accounts', 'Categories',
  function($scope, $filter, $stateParams, $state, $location, $modal, Authentication, Incomes, Expenses, Accounts, Categories) {
    $scope.authentication = Authentication;



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



            //Customize data to enable toggle recurrence:
            var recurringVar;
            if(income.monthly === true){
              recurringVar = 'monthly';
            } else if( income.yearly === true){
              recurringVar = 'yearly';
            }else{
              recurringVar = 'not recurring';
            }
            income.date = new Date(income.date);
            income.recurring = recurringVar;
            income.amount = Number(income.amount);
            that.income = income;
          });

      $scope.findAccounts();
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
        templateUrl: 'modules/incomes/views/create-income.client.view.html',
        controller: 'IncomeCreateController',
        size:  'md',
        resolve: {
          items: items
        }
      });
    }

    $scope.showEditModal= function(income, $event, doApplyFilter){
      var callback = function(){};
      if(doApplyFilter === true){
        callback = applyFilter;
      }

      $scope.findAccounts();
      $scope.findCategories();

      openModal(function () { return {accounts: $scope.accounts ,categories: $scope.categories, income: income, heading:'Edit Income', method: 'update', callback: callback} });
      $event.preventDefault();
    }

    function findCategoriesAndAccounts(){
      if(!$scope.categories)
        $scope.findCategories();
      if(!$scope.accounts)
        $scope.findAccounts();
    }

    function setUpModals(){

      if($state.current.name=='createIncome'){
        findCategoriesAndAccounts();
        openModal(function () { return {accounts: $scope.accounts ,categories: $scope.categories, income: null, heading:'New Income', method: 'new'} });
      }
      else if( $state.current.name=='editIncome'){
        findCategoriesAndAccounts();
        $scope.findOne();

        openModal(function () { return {accounts: $scope.accounts, categories: $scope.categories, income: $scope.income, heading:'Edit Income', method: 'update'} });
      }
    }

    setUpModals();



  }
]);