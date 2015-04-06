'use strict';

angular.module('incomes').filter('findBy', [
	function() {
      return function(input, id) {
        var i=0, len=input.length;
        for (; i<len; i++) {
          if (input[i]._id === id) {
            return input[i];
          }
        }
        return null;
      };
	}
]);