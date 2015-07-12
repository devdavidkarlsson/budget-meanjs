/**
 * Created with JetBrains WebStorm.
 * User: david
 * Date: 15-07-12
 * Time: 20:24
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created with JetBrains WebStorm.
 * User: david
 * Date: 15-07-12
 * Time: 17:45
 * To change this template use File | Settings | File Templates.
 */
// Accounts controller
angular.module('categories').controller('CategoryRemoveController', ['$scope', '$stateParams',  '$location', 'Authentication', 'Categories', '$modalInstance','items',
  function($scope, $stateParams, $location, Authentication, Categories, $modalInstance, items) {
    $scope.authentication = Authentication;

    $scope.category = items.category || {};
    $scope.categories = items.categories || [];
    $scope.heading = items.heading;

    // Remove existing Category
    $scope.remove = function(category) {
      var oldId = category._id;
      if ( category ) {
        category.$remove();

        for (var i in $scope.categories) {
          if ($scope.categories [i] === category) {
            $scope.categories.splice(i, 1);
          }
        }
      } else {
        $scope.category.$remove(function() {
          $location.path('categories');
        });
      }

      if(items.callback)
      items.callback();

      $modalInstance.dismiss('cancel');
      if($location.url().includes('/' + oldId)) $location.url($location.url().replace('/' + oldId,''));

    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };



  }
]);
