/**
 * Created with JetBrains WebStorm.
 * User: david
 * Date: 15-07-12
 * Time: 11:04
 * To change this template use File | Settings | File Templates.
 */

// Accounts controller
angular.module('accounts').controller('AccountCreateController', ['$scope', '$stateParams', '$location', 'Authentication', 'Accounts', '$modalInstance','items',
  function($scope, $stateParams, $location, Authentication, Accounts, $modalInstance, items) {
    $scope.authentication = Authentication;

    $scope.account = items.account || {};
    $scope.heading = items.heading;

    // Update existing Account
    function update() {
      var account = $scope.account;

      account.$update(function() {
        $location.path('accounts/' + account._id);
        $scope.account.name = '';
        $scope.account.desc = '';
        $modalInstance.close();
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Create new Account
    function createNew() {
      // Create new Account object
      var newAccount = $scope.account;
      var account = new Accounts ({
        name: newAccount.name,
        desc: newAccount.desc,
        interests: []
      });

      //Store interest:
      var interest = {
        rate: newAccount.rate,
        date: newAccount.date
      };

      account.interests.push(interest);

      // Redirect after save
      account.$save(function(response) {
        //$location.path('accounts/' + response._id);

        // Clear form fields
        $scope.account.name = '';
        $scope.account.desc = '';
        $modalInstance.close();
        toList();
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
      toList();
    };

    $scope.submit = function(){
      if(items.method === 'update'){
       if($scope.account.name.length>0)
       update();
      }else if(items.method === 'new'){
       createNew();
      }
    }

    function toList(){
      //Return to the list of the current REST url:
      $location.url('/'+$location.$$path.split('/')[1]);
    }

  }
  ]);