'use strict';

// Categories controller
angular.module('categories').controller('CategoriesController', ['$scope', '$stateParams', '$location', 'Authentication','$q', 'Categories','Expenses','Accounts',
	function($scope, $stateParams, $location, Authentication, $q, Categories, Expenses, Accounts) {
		$scope.authentication = Authentication;
        $scope.amount_arr = [];
        $scope.sum_arr = [];
        $scope.sum_chart_values = [];

        //Define values to monthly
        $scope.amount_chart_values = [];
        $scope.categories_chart_labels = [];

        $scope.account_category_chart_labels = [];
        $scope.account_category_chart_values = [];

        //dynamic style:
        $scope.header_width = $(".navbar-collapse").width();

        //Budget, sum
        $scope.grand_total = [0, 0];

        $scope.graphGrain = 'month';

      $scope.updateGraphGrain = function(grain){
        $scope.graphGrain = grain;
        $scope.setLengthOfGraph(grain);
        setUpMonthSelector();
      }

      function stripTimezoneFromDate(date_){
        var date= new Date(date_);
        return new Date(moment.utc([date.getFullYear(), date.getMonth(), date.getDate()]).format());
      }

      /*$scope.registerChartClickEvents= function(){
        var canvas = document.getElementById('pie2');

        var ctx = canvas.getContext("2d");
        var myPieChart = new Chart(ctx).Pie();

        canvas.onclick = function(evt){
          debugger;
          var activePoints = myPieChart.getSegmentsAtEvent(evt);
          debugger;// => activePoints is an array of segments on the canvas that are at the same position as the click event.
        };
      }*/

      //Click should redirect to category:
      $scope.onClick = function(evt){
        $scope.categories.forEach(function(category){
          if(category.name === evt[0].label){
           console.log(category._id);
            $location.path( 'categories/'+ category._id );
          }
        });
      }

      $scope.setLengthOfGraph = function(grain){

        $scope.categories.forEach(function(category){
          if(category.period === 'yearly'){
            if(grain === 'month'){
              category.amount /= 12;
              category.period = 'monthly';

            }
          } else if(category.period === 'monthly'){
            if(grain === 'year'){
              category.amount *= 12;
              category.period = 'yearly';
            }
          }
          category.color = progressColor(category);
        });

      }


        // Create new Category
		$scope.create = function() {
			// Create new Category object
			var category = new Categories ({
				name: this.name,
                amount: this.amount,
                period: this.period
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
              getExpensesForCategory(category._id, -1).then(function(cashflows){
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
          });
		};

		// Find existing Category
		$scope.findOne = function() {
			Categories.get({
				categoryId: $stateParams.categoryId
			}).$promise.then(function(category){
                  $scope.category = category;
            $scope.findExpensesWithCategory($scope.category._id);
                });
		};


      // Find a list of Categories
      $scope.findExpensesWithCategory = function(categoryId) {
        $scope.expenses =  [];
        Expenses.query().$promise.then(function(allExpenses){
          allExpenses.forEach(function(expense){
            if(expense.category === categoryId){
              $scope.getAccountForExpense(expense).then(function(data){
                expense.fromAccountName = data;
                $scope.getAllCashflowInstances(expense).forEach(function(expenseInstance){
                  $scope.expenses.push(expenseInstance);
                });
              });
            }
          });
        });
      }


      $scope.getAccountForExpense = function(expense) {
        var deferred = $q.defer();
        var matchingAccount;
        Accounts.query().$promise.then(function(accounts){
          accounts.forEach(function(account){
            if(expense.fromAccount === account._id){
              matchingAccount = account.name;
            }
          });
          deferred.resolve(matchingAccount);
        });
         return deferred.promise;
      }



      /*
       *  Instantiate cash flows from inital cashflow that occurs once, monthly or yearly.
       *  Returns an array of all cashflows. Add moment.js?
       */

      $scope.getAllCashflowInstances = function(cashflow) {
        var initialDate = new Date(cashflow.date),
            currentDate = new Date(),
            cashflows = [],
            newDate,newMonth, newYear, newCashflow, addToLastDayOfMonth,
            startDate = initialDate;

        if(cashflow.monthly === true){
          var monthDiff = 0;

          while (startDate <= currentDate) {

            cashflow.date=startDate;
            newCashflow = JSON.parse(JSON.stringify(cashflow));
            cashflows.push(newCashflow);

            //Go to next month's instance
            monthDiff++;
            newDate = moment(initialDate).add(monthDiff, 'months');

            startDate = new Date(newDate);
          }
        }




        else if(cashflow.yearly === true){
          addToLastDayOfMonth=isLastDayOfMonth(startDate);


          while (startDate <= currentDate) {
            cashflow.date=startDate;
            newCashflow = JSON.parse(JSON.stringify(cashflow));
            cashflows.push(newCashflow);
            console.log('new year:' + startDate.getFullYear());



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
        }else{
          //Not reccuring
          cashflows.push(cashflow);
        }
        return cashflows;
      }


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
        //First handle get all:
        if(month < 0){
          return getAllCashflowInstancesBetweenDates(
              cashflow,
              stripTimezoneFromDate(new Date(cashflow.date)),
              new Date()
          );
        }
        return getAllCashflowInstancesBetweenDates(
            cashflow,
            stripTimezoneFromDate(new Date(new Date().setMonth(month)).setDate(1)),
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
        }else if(stripTimezoneFromDate((cashflow.date)) <= endDate && stripTimezoneFromDate(new Date(cashflow.date)) >= startDate){
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


      //MONTH SELECTION UI:

      /*Setup what months to be selectable for the header, needs to be called on changing grain, and year*/
      function setUpMonthSelector(){

        //Default setting if no year/month selected:
        if(!$scope.selectedYear){
          $scope.selectedYear= getCurrentYear();
        }
        if(!$scope.selectedMonth){
          var monthYear = moment( getCurrentMonth()+1 +" " + $scope.selectedYear, "MM YYYY");
          $scope.selectedMonth = monthYear.format("MMMM");
        }
       //Iterate months and populates array of month names:
       var selectable_months_arr = [],
            all_months_arr = [],
            last_to_show;


       if( $scope.graphGrain === 'month'){
          if($scope.selectedYear < getCurrentYear()){
            console.log("Show 12 months");
            last_to_show = 11;
          }else{
            console.log("Show months until "+getCurrentMonth());
            last_to_show = getCurrentMonth();
          }
          for(var i = 0; i <= 11; i++){
            var monthYear = moment( i+1 +" " + $scope.selectedYear, "MM YYYY");
            //add to active months:
            if(i<= last_to_show){
              selectable_months_arr.push(monthYear.format("MMMM"));
            }
            //Add to all months array:
              all_months_arr.push(monthYear.format("MMMM"));
          }
       }
        $scope.all_months_arr = all_months_arr;
        $scope.selectable_months_arr = selectable_months_arr;
      }


      $scope.clickedMonthInMonthSelector = function(month){
        $scope.selectedMonth = month;
        setUpMonthSelector();
      }

      $scope.selectedYearDidUpdate = function(){
        setUpMonthSelector();
      }


      function getCurrentMonth(){
        var now = moment();
        return now.month();
      }

      function getCurrentYear(){
        var now = moment();
        return now.year();
      }

      $scope.maxSelectableYear= function(){
        return getCurrentYear();
      }

      $scope.monthShouldBeSelectable = function (month){
          return ($scope.selectable_months_arr.indexOf(month) > -1);
      }

      function updateHeaderMargin(months){
        $scope.header_margin = $scope.header_width/months.length();
      }


      //INITS:
      setUpMonthSelector();

    }
]);