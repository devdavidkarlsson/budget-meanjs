/**
 * Created with JetBrains WebStorm.
 * User: david
 * Date: 15-07-12
 * Time: 17:45
 * To change this template use File | Settings | File Templates.
 */
// Accounts controller
angular.module('categories').controller('CategoryCreateController', ['$scope', '$stateParams',  '$location', 'Authentication', 'Categories', '$modalInstance','items',
  function($scope, $stateParams, $location, Authentication, Categories, $modalInstance, items) {
    $scope.authentication = Authentication;

    $scope.category = items.category || {};
    $scope.heading = items.heading;

    // Update existing Category
    function update() {
      var category = $scope.category;

      category.$update(function() {
        //$location.path('categories/' + category._id);
        $modalInstance.close();
        removeCreateEditFromPath();
        if(items.callback){
          items.callback();
        }
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Create new Category
    function createNew() {
      var newCategory = $scope.category;

        // Create new Category object
        var category = new Categories ({
          name: newCategory.name,
          amount: newCategory.amount,
          period: newCategory.period
        });

        // Redirect after save
        category.$save(function(response) {
          //$location.path('categories/' + response._id);

          // Clear form fields
          newCategory.name = '';
          newCategory.amount = '';
          $modalInstance.close();
          removeCreateEditFromPath();
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
        if($scope.category.name.length>0)
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