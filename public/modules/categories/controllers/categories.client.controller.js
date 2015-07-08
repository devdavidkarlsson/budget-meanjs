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

        $scope.filter = {
          yearly: function(){return ($scope.graphGrain === 'yearly');},
          monthly: function(){return ($scope.graphGrain === 'monthly');},
          year: function(){ return $scope.selectedYear;},
          month: function(){ return $scope.selectedMonth;}
        };




      $scope.updateGraphGrain = function(grain){
        $scope.graphGrain = grain;
        $scope.setLengthOfGraph(grain);
        setUpMonthSelector();
        applyFilter();

      }

      function stripTimezoneFromDate(date_){
        var date= new Date(date_);
        return new Date(moment.utc([date.getFullYear(), date.getMonth(), date.getDate()]).format());
      }

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
          if(category.period === 'yearly' && category.recalc === true){
            if(grain === 'month'){
              category.amount /= 12;
              category.period = 'monthly';

            }
          } else if(category.period === 'monthly' && category.recalc === true){
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
          Categories.query().$promise.then(function(categories){

            $scope.categories = categories;

            applyFilter();

            $scope.categorySummationComplete = true;
          });
		};


      function getExpencesForCategoryAndYear(category, year){

      }

      //Should be performed on filter change
      function applyFilter(){

        var categories = $scope.categories;

        //Define values to monthly
        $scope.amount_chart_values = [];
        $scope.sum_chart_values = [];
        $scope.categories_chart_labels = [];
        $scope.grand_total = [0, 0];


        categories.forEach(function(category){
          var categoriesForMonth;
          if($scope.graphGrain=='month' && $scope.selectedMonth ){
            categoriesForMonth = Number(moment().month($scope.selectedMonth).format('MM'))-1;
          }
          else{
            categoriesForMonth = -1;
          }

          getExpensesForCategory(category, categoriesForMonth).then(function(cashflows){
            //Calculate sums for bar-charts
            category.sum = getTotalCashflowSum(cashflows);
            category.color = progressColor(category);


            //Grand total for display:
            $scope.grand_total[0] += category.amount;
            $scope.grand_total[1] += category.sum;

            //Add to pie-chart array:
            $scope.sum_chart_values.push(category.sum);
            $scope.amount_chart_values.push(category.amount);
            $scope.categories_chart_labels.push(category.name);


          });

        });
      }


      function getExpensesForCategory(category, monthOrYear){
        var deferred = $q.defer();
        var cashflows= [];
          Expenses.query().$promise.then(function(allExpenses){
            allExpenses.forEach(function(expense){
              if(expense.category===category._id){
                if(monthOrYear < 0){
                  //Get Year:

                  getAllCashflowInstancesForYear(expense, $scope.filter.year()).forEach(function(expenceInstance){
                    cashflows.push(expenceInstance);
                  });
                }else{
                  //Get Month:
                  getAllCashflowInstancesForMonth(expense, monthOrYear).forEach(function(expenceInstance){
                    cashflows.push(expenceInstance);
                  });
                }

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

      /*
       *  Instantiate cash flows from inital cashflow that occurs once, monthly or yearly.
       *  Returns an array of all cashflows. Add moment.js?
       */

      function getAllCashflowInstances(cashflow) {
        return getAllCashflowInstancesBetweenDates(
            cashflow,
            moment(cashflow.date),
            moment()
        );
      }

      //Return the current year:
      function getAllCashflowInstancesForYear(cashflow, year){
        var endDate;
        if(year < moment().year()){
           endDate = moment().year(year).month(12).date(0).endOf('day');
        }else{
          endDate = moment();
        }

        return getAllCashflowInstancesBetweenDates(
            cashflow,
            //Should have year as well:
            moment().year(year).month(0).date(1).startOf('day'),
            endDate
        );
      }

      //Return the current month:
      function getAllCashflowInstancesForMonth(cashflow, month){
        return getAllCashflowInstancesBetweenDates(
            cashflow,
            //Should have year as well:
            moment().year($scope.selectedYear).month(month).date(1).startOf('day'),
            moment().year($scope.selectedYear).month(month+1).date(0).endOf('day')
        );
      }


      //Instantiate all cashflows in dateRange: startDate til endDate, returns an array or an empty array if no cashflows in range.
      function getAllCashflowInstancesBetweenDates(cashflow, startDate, endDate) {

        var
            cashflows = [],
            currentInstance,nextInstance, IncreasedInstance, newCashflow, addToLastDayOfMonth, dateStep;
        //If it is the last day of month, make sure all the created instances get last day of month:
        addToLastDayOfMonth=isLastDayOfMonth(startDate);

        var firstInstance = moment(cashflow.date);

        if(cashflow.monthly === true){
          dateStep = 'months';
          //Make sure date is in range:
          while(firstInstance < startDate)
          {
            firstInstance = moment(firstInstance).add(1, dateStep);
          }
        }
        else if(cashflow.yearly === true)
        {
          dateStep = 'years';
          //Make sure date is in range, with respect to year:
          while(firstInstance.year() < startDate.year())
          {
            firstInstance = moment(firstInstance).add(1, dateStep);
          }
        }


        //Iterate all instances until end date is reached:
        var currentInstance = firstInstance;
        while (startDate <= currentInstance && currentInstance <= endDate) {

          cashflow.date = currentInstance;
          newCashflow = JSON.parse(JSON.stringify(cashflow));
          cashflows.push(newCashflow);

          //If cashflow not recurring:
          if(dateStep === undefined){

            break;
          }
          //Go to next year/month's instance
          IncreasedInstance = currentInstance.add(1, dateStep);


          if(addToLastDayOfMonth){
            //make sure the day exists in all months before procceding:
            //Create an instance at the last day of the month
            nextInstance = getLastDateOfMonth(IncreasedInstance);
          }else{
            //If date is not last of month: Keep the day number set in the cashflow:
            nextInstance = IncreasedInstance;
          }
          currentInstance = nextInstance;
        }


        return cashflows;
      }

      //Check to verify if the selected date is the last day of month:
      function isLastDayOfMonth(dt) {

        return moment(dt).add(1, 'days').get('month') !== dt.get('month');
      }

      function getLastDateOfMonth(date){
        //console.log(date);
        return date.add(1, 'months').date(0);
      }

      function getTotalCashflowSum(cashflows){
        var sumCashflows = 0;
        cashflows.forEach(function(flow) {
          sumCashflows += Number(flow.amount);
        });
        return sumCashflows;
      }

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
                getAllCashflowInstances(expense).forEach(function(expenseInstance){
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


      //Helpers for summing categories:


      function progressColor(category){
        if(category.sum > category.amount){
          return 'danger';
        }else if( category.sum > category.amount/2){
          return 'warning';
        }else{
          return 'success';
        }
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
            //Show 12 months
            last_to_show = 11;
          }else{
            //Show selectable months until getCurrentMonth()
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
        applyFilter();
      }

      $scope.selectedYearDidUpdate = function(){
        setUpMonthSelector();
        applyFilter();
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
]).filter('capitalize', function() {
  return function(input, scope) {
    if (input!=null)
      input = input.toLowerCase();
    return input.substring(0,1).toUpperCase()+input.substring(1);
  }
});;