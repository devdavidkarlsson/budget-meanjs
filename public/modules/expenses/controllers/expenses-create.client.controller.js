/**
 * Created with JetBrains WebStorm.
 * User: david
 * Date: 15-07-15
 * Time: 08:41
 * To change this template use File | Settings | File Templates.
 */

// Accounts controller
angular.module('expenses').controller('ExpenseCreateController', ['$scope', '$stateParams',  '$location', 'Authentication', 'Expenses', '$modalInstance','items',
  function($scope, $stateParams, $location, Authentication, Expenses, $modalInstance, items) {
    $scope.authentication = Authentication;

    $scope.expense = items.expense || {};
    $scope.accounts = items.accounts || {};
    $scope.categories = items.categories || {};

    $scope.heading = items.heading;

    function stripTimezoneFromDate(date_){
      var date= new Date(date_);
      return moment.utc([date.getFullYear(), date.getMonth(), date.getDate()]).format();
    }

    // Create new Expense
    function createNew() {

      var newExpense = $scope.expense;
      // Create new Expense object
      var expense = new Expenses ({
        name: newExpense.name,
        amount: newExpense.amount,
        date: stripTimezoneFromDate(newExpense.date),
        monthly: newExpense.recurring==='monthly',
        yearly: newExpense.recurring==='yearly',
        fromAccount: newExpense.fromAccount,
        category: newExpense.category
      });

      // Redirect after save
      expense.$save(function(response) {
        $location.path('expenses/' + response._id);

        // Clear form fields
        //$scope.name = '';
        $modalInstance.close();
        removeCreateEditFromPath();
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };



    // Update existing Expense
    function update() {
      var expense = $scope.expense;

      var updatedExpense = new Expenses({
        name: expense.name,
        amount: expense.amount,
        date: stripTimezoneFromDate(expense.date),
        monthly: expense.recurring==='monthly',
        yearly: expense.recurring==='yearly',
        fromAccount: expense.fromAccount,
        category: expense.category,
        _id: expense._id});

      updatedExpense.$update(function() {
        //$location.path('expenses/' + updatedExpense._id);
        $modalInstance.close();
        removeCreateEditFromPath();
        if(items.callback){
          items.callback();
        }
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
      removeCreateEditFromPath();
    };

    $scope.submit = function(){
      if(items.method === 'update'){
        if($scope.expense.name.length>0)
          update();
      }else if(items.method === 'new'){
        createNew();
      }
    }



    function removeCreateEditFromPath(){
      //Return to the list/item of the current REST url:
      if($location.url().includes('/edit')) $location.url($location.url().replace('/edit',''));
      else if($location.url().includes('/create'))  $location.url($location.url().replace('/create',''));
    }

  }
]);