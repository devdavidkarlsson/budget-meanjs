'use strict';

angular.module('ng').directive('chart',
	function() {
		return {
			templateUrl: '/modules/categories/directives/pie.client.template.html',
			restrict: 'E',
            scope: {obj: '='},
			link: function (scope, element, attrs) {
              scope.chartConfig=scope.obj;
              //scope.chartConfig ={'options':{'chart':{'type':'pie'},'plotOptions':{'series':[{'name':'Some data 3','data':[3,1,null,5,2],'connectNulls':true,'id':'series-1'}]}}};
              //http://jsfiddle.net/joshdmiller/FHVD9/
				//element.text('this is the pie directive');
			}
		};
	}
);