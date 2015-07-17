/**
 * Created with JetBrains WebStorm.
 * User: david
 * Date: 15-07-15
 * Time: 08:41
 * To change this template use File | Settings | File Templates.
 */

// Accounts controller
angular.module('incomes').controller('IncomeCreateController', ['$scope', '$stateParams',  '$location', 'Authentication', 'Incomes', '$modalInstance','items',
  function($scope, $stateParams, $location, Authentication, Incomes, $modalInstance, items) {
    $scope.authentication = Authentication;

    $scope.income = items.income || {};
    $scope.accounts = items.accounts || {};
    $scope.categories = items.categories || {};

    $scope.heading = items.heading;



    function stripTimezoneFromDate(date_){
      var date= new Date(date_);
      return moment.utc([date.getFullYear(), date.getMonth(), date.getDate()]).format();
    }


    // Create new Income
    function createNew() {
      var newIncome = $scope.income;
      // Create new Income object
      var income = new Incomes ({
        name: newIncome.name,
        amount: newIncome.amount,
        date: stripTimezoneFromDate(newIncome.date),
        monthly: newIncome.recurring==='monthly',
        yearly: newIncome.recurring==='yearly',
        toAccount: newIncome.toAccount
      });


      // Redirect after save
      income.$save(function(response) {
        $location.path('incomes/' + response._id);

        // Clear form fields
        $scope.name = '';
        $modalInstance.close();
        removeCreateEditFromPath();
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Update existing Income
    function update() {

      var income = $scope.income;
      var updatedIncome = new Incomes ({
        name: income.name,
        amount: income.amount,
        date: stripTimezoneFromDate(income.date),
        monthly: income.recurring==='monthly',
        yearly: income.recurring==='yearly',
        toAccount: income.toAccount,
        _id: income._id
      });

      updatedIncome.$update(function() {
        //$location.path('incomes/' + updatedIncome._id);
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
        if($scope.income.name.length>0)
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