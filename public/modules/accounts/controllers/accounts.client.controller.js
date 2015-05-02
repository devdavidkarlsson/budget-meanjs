'use strict';

// Accounts controller
angular.module('accounts').controller('AccountsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Accounts','Expenses','Incomes','$q',
  function($scope, $stateParams, $location, Authentication, Accounts, Expenses, Incomes, $q ) {
    $scope.authentication = Authentication;
    var removeTemplate ='<button id="deleteBtn" type="button" class="btn-small" ng-click="getExternalScopes().removeRow(row)">Delete</button> ';

    $scope.show='home';


    $scope.updateGraphGrain = function(grain){
      $scope.graphGrain = grain;
      $scope.mergeGraphValues(null);
      $scope.showGraph();
    }

    $scope.showGraph = function(){

      $scope.show='graph';
      $scope.transactions_graph_values_ = $scope.transactions_graph_values;
      $scope.transactions_cumulative_graph_values_ = $scope.transactions_cumulative_graph_values;
      $scope.transactions_graph_labels_ = $scope.labels;
      $scope.transactions_graph_options = {responsive:true,
                                           scaleBeginAtZero:false,
                                           barBeginAtOrigin:true};

    }



    /// /Grid setup
    $scope.$scope = $scope;

    $scope.addInterestItem = function(){
      $scope.account.interests.push({});
    };

    $scope.removeRow = function(row) {
      var index=$scope.account.interests.indexOf(row.entity);
      $scope.account.interests.splice(index, 1);
    };



    $scope.gridOptions = {
      data: 'account.interests',
      enableCellEdit: true,
      columnDefs: [{
        field: 'rate',
        width: 60
      },
        {
          field: 'date',
          cellFilter: 'date:\'yyyy-MM-dd\''
        },
        {
          field: 'remove',
          displayName:'',
          cellTemplate: removeTemplate,
          width: 60,
          enableCellEdit:false
        }]
    };


    // Create new Account
    $scope.create = function() {

      // Create new Account object
      var account = new Accounts ({
        name: this.name,
        desc: this.desc,
        interests: []
      });

      //Store interest:
      var interest = {
        rate: this.rate,
        date: this.date
      };

      account.interests.push(interest);




      // Redirect after save
      account.$save(function(response) {
        $location.path('accounts/' + response._id);

        // Clear form fields
        $scope.name = '';
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Account
    $scope.remove = function(account) {
      if ( account ) {
        account.$remove();

        for (var i in $scope.accounts) {
          if ($scope.accounts [i] === account) {
            $scope.accounts.splice(i, 1);
          }
        }
      } else {
        $scope.account.$remove(function() {
          $location.path('accounts');
        });
      }
    };

    // Update existing Account
    $scope.update = function() {
      var account = $scope.account;

      account.$update(function() {
        $location.path('accounts/' + account._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Accounts
    $scope.find = function() {
      var that = this;
      Accounts.query().$promise.then(function(accounts){
        that.accounts=accounts;

        accounts.forEach(function(account){
          getCashflowsForAccount(account._id).then(function(cashflows){
            account.sum = getTotalCashflowSum(cashflows);
            console.log(account.name+':' + account.sum);
          });
        });
      });

    };

    // Find existing Account
    $scope.findOne = function() {
      this.account = Accounts.get({
        accountId: $stateParams.accountId
      });
    };


    //Find an existing Account and it's corresponding cashflows
    $scope.calculateOne = function(){
      var accountId= $stateParams.accountId;
      $scope.findOne();

      $scope.sumCashflows = 0;


      getCashflowsForAccount(accountId).then(function(cashflows){

        $scope.mergeGraphValues(getGraphValues(cashflows));
        //Calculate the sum:
        $scope.sumCashflows = getTotalCashflowSum(cashflows);
        $scope.cashflows=cashflows;
      });
    };

    $scope.mergeGraphValues = function (graphValues){
      if(!graphValues){
        graphValues = getGraphValues($scope.cashflows);
      }
      //Merge values at the same day:
      // Day:  Complete string
      // Month: is month index: 1 and year index: 3
      // Year: is year index: 3
      var sum = {};
      var i,key;
      for (i = 0; i < graphValues.length; i++) {
        if($scope.graphGrain === 'month'){
          var tmpDateArr = (graphValues[i][0]+'').split(' ');
          key = tmpDateArr[1]+' '+tmpDateArr[3];
        }else if($scope.graphGrain === 'year'){
          var tmpDateArr = (graphValues[i][0]+'').split(' ');
          key = tmpDateArr[3];
        }else{
          key = graphValues[i][0];
        }
        var oldSum = sum[key];
        if (typeof oldSum === 'undefined') {
          oldSum = 0;
        }
        sum[key] = oldSum + Number(graphValues[i][1]);
      }


      //reformat array to fit chart.js:
      $scope.transactions_cumulative_graph_values = [];
      $scope.transactions_graph_values = [];
      $scope.transactions_graph_values.push([]);
      $scope.transactions_cumulative_graph_values.push([]);

      $scope.labels=[];


      for(key in sum){
        $scope.transactions_graph_values[0].push(sum[key]);

        var cum = $scope.transactions_graph_values[0].reduce(function(pv, cv) { return pv + cv; }, 0);
        $scope.transactions_cumulative_graph_values[0].push(cum);
        $scope.labels.push(key.split(' 00')[0]);
      }


    }

    function getCashflowsForAccount(accountId){
      var deferred = $q.defer();
      var cashflows= [];


      deferred.notify('About to query ' + accountId + '.');
      Incomes.query().$promise.then(function(allIncomes){
        allIncomes.forEach(function(income){
          if(income.toAccount===accountId){
            getAllCashflowInstances(income).forEach(function(incomeInstance){
              cashflows.push(incomeInstance);
            });
          }

        });

        Expenses.query().$promise.then(function(allExpenses){
          allExpenses.forEach(function(expense){
            if(expense.fromAccount===accountId){
              expense.amount=-expense.amount;
              getAllCashflowInstances(expense).forEach(function(expenceInstance){
                cashflows.push(expenceInstance);
              });

            }
          });
          //Sort cashflows on date:
          cashflows.sort(function(a, b) {
            return new Date(a.date) - new Date(b.date);
          });
          if (true) {
            deferred.resolve(cashflows);
          } else {
            deferred.reject('It never fails!');
          }
        });
      });




      return deferred.promise;
    }

    function getTotalCashflowSum(cashflows){
      var sumCashflows = 0;
      cashflows.forEach(function(flow) {
        sumCashflows += Number(flow.amount);
      });
      return sumCashflows;
    }

    function getGraphValues(cashflows){
      var graphValues = [];
      cashflows.forEach(function(flow) {
        graphValues.push([new Date(flow.date),flow.amount]);
      });
      return graphValues;
    }


    function getAllCashflowInstances(cashflow) {
      var startDate=new Date(cashflow.date),
          currentDate= new Date(),
          cashflows = [],
          newDate,newMonth, newYear, newCashflow, addToLastDayOfMonth;

      if(cashflow.monthly === true){
        //If it is the last day of month, make sure all the created instances get last day of month:
        addToLastDayOfMonth=isLastDayOfMonth(startDate);


        while (startDate <= currentDate) {
          cashflow.date=startDate;
          newCashflow = JSON.parse(JSON.stringify(cashflow));
          cashflows.push(newCashflow);

          //Go to next month's instance
          newMonth=startDate.getMonth()+1;

          if(addToLastDayOfMonth){
            //make sure the example day exists in all months before procceding:
            startDate.setDate(1);
            //Create an instance at the last day of the month
            newDate = getLastDateOfMonth(new Date(new Date(startDate).setMonth(newMonth)));
          }else{
            //special februari handling for 30,31 monthly:
            var daysInFeb = new Date(new Date(new Date(startDate).setMonth(newMonth+1)).setDate(0)).getDate();
            /*if(newMonth===1 && startDate.getDate() > daysInFeb){
              //Special februari if date is the 30,31th:
              newDate = new Date(new Date(startDate).setMonth(newMonth)).setDate(daysInFeb);
            //If date is not last of month: Keep the day number set in the cashflow:
            }else{ */{
              //This does not do things correctly, if januari the 30th, 28th of februari should be used, and then in march again the 30th should be used..:
              newDate = new Date(startDate).setMonth(newMonth);

            }
          }
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


    $scope.xAxisTickFormatFunction = function(){
      return function(d){
        return d3.time.format('%b')(new Date(d));
      };
    };


  }
]);