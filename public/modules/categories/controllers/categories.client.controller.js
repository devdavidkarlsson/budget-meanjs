'use strict';

// Categories controller
angular.module('categories').controller('CategoriesController', ['$scope', '$stateParams', '$location', 'Authentication','$q', 'Categories','Expenses',
	function($scope, $stateParams, $location, Authentication, $q, Categories,Expenses) {
		$scope.authentication = Authentication;
        $scope.amount_arr = [];
        $scope.sum_arr = [];
        $scope.sum_chart_values = [];
        $scope.amount_chart_values = [];
        $scope.categories_chart_labels = [];

        //Budget, sum
        $scope.grand_total = [0, 0];


        // Create new Category
		$scope.create = function() {
			// Create new Category object
			var category = new Categories ({
				name: this.name,
                amount: this.amount
			});

			// Redirect after save
			category.$save(function(response) {
				$location.path('categories/' + response._id);

				// Clear form fields
				$scope.name = '';
                $scope.amount = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Category
		$scope.remove = function(category) {
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
		};

		// Update existing Category
		$scope.update = function() {
			var category = $scope.category;

			category.$update(function() {
				$location.path('categories/' + category._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};


		// Find a list of Categories
		$scope.find = function() {
          var that = this;
          Categories.query().$promise.then(function(categories){

            that.categories=categories;

            categories.forEach(function(category){
              getExpensesForCategory(category._id, 8).then(function(cashflows){

                //Calculate sums for bar-charts
                category.sum = getTotalCashflowSum(cashflows);
                category.color = progressColor(category);

                //$scope.sum_arr.push([category.name, category.sum]);
                //$scope.amount_arr.push([category.name, category.amount]);
                //Grand total for display:
                $scope.grand_total[0] += category.amount;
                $scope.grand_total[1] += category.sum;

                //Add to pie-chart array:
                $scope.sum_chart_values.push(category.sum);
                $scope.amount_chart_values.push(category.amount);
                $scope.categories_chart_labels.push(category.name);


              }).then(function(){
                  categories.forEach(function(category){
                    //console.log('sum:'+ category.sum);
                  });
              });

            });

            that.categorySummationComplete = true;
          })
		};

		// Find existing Category
		$scope.findOne = function() {
			$scope.category = Categories.get({ 
				categoryId: $stateParams.categoryId
			});
		};





      //Helpers for summing categories:


      function progressColor(category){
        //console.log('Name: '+ category.name+'sum: '+category.sum+ '  amount:'+category.amount);
        if(category.sum > category.amount){
          return 'danger';
        }else if( category.sum > category.amount/2){
          return 'warning';
        }else{
          return 'success';
        }
      }


      function getExpensesForCategory(categoryId, month){
        var deferred = $q.defer();
        var cashflows= [];


        deferred.notify('About to query ' + categoryId + '.');


          Expenses.query().$promise.then(function(allExpenses){
            allExpenses.forEach(function(expense){
              if(expense.category===categoryId){
                //expense.amount += expense.amount;
                getAllCashflowInstancesForMonth(expense, month).forEach(function(expenceInstance){
                  cashflows.push(expenceInstance);
                });

              }
            });
            //Sort cashflows on date:
            cashflows.sort(function(a, b) {
              return new Date(a.date) - new Date(b.date);
            });
            deferred.resolve(cashflows);
          });

        return deferred.promise;
      }


      //Return the current month:
      function getAllCashflowInstancesForMonth(cashflow, month){
        return getAllCashflowInstancesBetweenDates(
            cashflow,
            new Date(new Date(new Date().setMonth(month)).setDate(1)),
            getLastDateOfMonth(new Date(new Date().setMonth(month)))

        );
      }

      //Instantiate all cashflows in dateRange: startDate til endDate, returns an array or an empty array if no cashflows in range.
      function getAllCashflowInstancesBetweenDates(cashflow, startDate, endDate) {
        var
            cashflows = [],
            newDate,newMonth, newYear, newCashflow, addToLastDayOfMonth;

        if(cashflow.monthly === true){
          //If it is the last day of month, make sure all the created instances get last day of month:
          addToLastDayOfMonth=isLastDayOfMonth(startDate);


          while (startDate <= endDate) {
            cashflow.date=startDate;
            newCashflow = JSON.parse(JSON.stringify(cashflow));
            cashflows.push(newCashflow);

            //Go to next month's instance
            newMonth=startDate.getMonth()+1;


            if(addToLastDayOfMonth){
              //make sure the day exists in all months before procceding:
              startDate.setDate(1);
              //Create an instance at the last day of the month
              newDate = getLastDateOfMonth(new Date(new Date(startDate).setMonth(newMonth)));
            }else{
              //If date is not last of month: Keep the day number set in the cashflow:
              newDate = new Date(startDate).setMonth(newMonth);
            }
            startDate = new Date(newDate);
          }
        }
        else if(cashflow.yearly === true){
          addToLastDayOfMonth=isLastDayOfMonth(startDate);


          while (startDate <= endDate) {
            cashflow.date=startDate;
            newCashflow = JSON.parse(JSON.stringify(cashflow));
            cashflows.push(newCashflow);



            newYear = startDate.getFullYear()+1;
            newDate = new Date(new Date(startDate).setFullYear(newYear));


            if(addToLastDayOfMonth){
              //Do corrections for last day of month
              newMonth=startDate.getMonth;
              //make sure the day exists in all months before procceding:
              startDate.setDate(1);
              //Create an instance at the last day of the month
              newDate = getLastDateOfMonth(new Date(new Date(newDate).setMonth(newMonth)));
            }
            startDate = new Date(newDate);
          }
        }else if(cashflow.date< endDate && cashflow.date>startDate){
          //Not reccuring
          cashflows.push(cashflow);
        }

        return cashflows;
      }

      //Check to verify if the selected date is the last day of month:
      function isLastDayOfMonth(dt) {
        var test = new Date(dt.getTime()),
            month = test.getMonth();
        test.setDate(test.getDate() + 1);
        return test.getMonth() !== month;
      }

      function getLastDateOfMonth(date){
        //console.log(date);
        return(new Date((new Date(date.getFullYear(), date.getMonth()+1,1))-1));
      }

      function getTotalCashflowSum(cashflows){
        var sumCashflows = 0;
        cashflows.forEach(function(flow) {
          sumCashflows += Number(flow.amount);
        });
        return sumCashflows;
      }


      $scope.sum_chart_values_ = {

      }

      $scope.amount_chart_values_ ={

      }

      /*$scope.amount_chart = {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false
        },
        title: {
          text: 'per Category'
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.percentage:.1f} %',
              style: {
                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
              }
            }
          }
        },
        series: [{
          type: 'pie',
          name: 'Sum',
          data: $scope.amount_arr
        }]
      };


      $scope.sum_chart = {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false
        },
        title: {
          text: 'per Category'
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.percentage:.1f} %',
              style: {
                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
              }
            }
          }
        },
        series: [{
          type: 'pie',
          name: 'Amount',
          data: $scope.sum_arr
        }]
      }; */




    }
]);