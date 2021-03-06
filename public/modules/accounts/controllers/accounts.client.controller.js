'use strict';

// Accounts controller
angular.module('accounts').controller('AccountsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Accounts','Expenses','Incomes','$q', '$modal','$state',
  function($scope, $stateParams, $location, Authentication, Accounts, Expenses, Incomes, $q, $modal, $state) {
    $scope.authentication = Authentication;
    var removeTemplate ='<button id="deleteBtn" type="button" class="btn-small" ng-click="getExternalScopes().removeRow(row)">Delete</button> ';

    $scope.show='home';
    $scope.graphGrain = 'month';


    $scope.updateGraphGrain = function(grain){
      $scope.graphGrain = grain;
      $scope.mergeGraphValues();
      $scope.showGraph();
    }

    $scope.showGraph = function(){

      $scope.show='graph';
      $scope.transactions_graph_values_ = $scope.transactions_graph_values;
      $scope.transactions_cumulative_graph_values_ = $scope.transactions_cumulative_graph_values;
      $scope.transactions_graph_labels_ = $scope.labels;
      $scope.transactions_cumulative_graph_labels_ = $scope.cumulative_labels;

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


    /*
    *  Find an existing Account and it's corresponding cashflows
    *  on the service.
    *
    *  Create graph data, sum and set cashflows to scope.
     */
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


    /*
    *  Merging method to build corresponding values for each period/grain
    *  in the graphs, deppending on selected grain (day/month/year).
    *
     */
    $scope.mergeGraphValues = function (graphValues){


      var graphValues = graphValues || getGraphValues($scope.cashflows);
      if(!graphValues || graphValues.length < 1){
        return;
      }

      //Get interval to show:
      var firstDate = moment(graphValues[0][0]);
      var lastDate = moment(graphValues[graphValues.length-1][0]);

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
        }else if($scope.graphGrain === 'day'){

          //Generate arr with all dates from first:
          for(var iteratedDate = firstDate; iteratedDate < lastDate; iteratedDate.add(1,'days')){
            var tmpEmptyDateArr = (iteratedDate._d+'').split(' ');
            key = tmpEmptyDateArr[1] + ' ' + tmpEmptyDateArr[2] + ' ' + tmpEmptyDateArr[3];
            sum[key] = 0;
          }



          var tmpDateArr = (graphValues[i][0]+'').split(' ');
          key = tmpDateArr[1] + ' ' + tmpDateArr[2] + ' ' + tmpDateArr[3];
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
      $scope.cumulative_labels=[];

      for(key in sum){
        $scope.transactions_graph_values[0].push(sum[key]);

        //Only label date with content:
        var xLabel ='';
        if(sum[key] !== 0){
          xLabel = key.split(' 00')[0];


        }
                 //If value change: push cumulative value:
        var cum = $scope.transactions_graph_values[0].reduce(function(pv, cv) { return pv + cv; }, 0);
        $scope.cumulative_labels.push(xLabel);
        $scope.transactions_cumulative_graph_values[0].push(cum);
        $scope.labels.push(xLabel);
      }



    }

    /*
    *  Generate cashflow instances for all incomes and expenses found on a specific account
    *  Returns deferred promise for use in then() method.
     */
    function getCashflowsForAccount(accountId){
      var deferred = $q.defer();
      var cashflows= [];


      deferred.notify('About to query ' + accountId + '.');
      Incomes.query().$promise.then(function(allIncomes){
        allIncomes.forEach(function(income){
          if(income.toAccount===accountId){
            $scope.getAllCashflowInstances(income).forEach(function(incomeInstance){
              cashflows.push(incomeInstance);
            });
          }

        });

        Expenses.query().$promise.then(function(allExpenses){
          allExpenses.forEach(function(expense){
            if(expense.fromAccount===accountId){
              expense.amount=-expense.amount;
              $scope.getAllCashflowInstances(expense).forEach(function(expenceInstance){
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

    /*
    *  Get the total sum of a cashflow array
     */
    function getTotalCashflowSum(cashflows){
      var sumCashflows = 0;
      cashflows.forEach(function(flow) {
        sumCashflows += Number(flow.amount);
      });
      return sumCashflows;
    }

    /*
    *  Generate cashflow map from array of cashflows:
     *  key-value: date, amount.
     */
    function getGraphValues(cashflows){
      var graphValues = [];
      cashflows.forEach(function(flow) {
        graphValues.push([new Date(flow.date),flow.amount]);
      });
      return graphValues;
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


    //Modal:
    function openModal(items){
      $modal.open({
        templateUrl: 'modules/accounts/views/create-update-account.client.view.html',
        controller: 'AccountCreateController',
        size:  'sm',
        resolve: {
          items: items
        }
      });
    }

    if($state.current.name=='createAccount'){
      openModal(function () { return {account: null, heading:'New Account', method: 'new'} });
    }
    else if( $state.current.name=='editAccount'){
      $scope.findOne()
      openModal(function () { return {account: $scope.account, heading:'Edit Account', method: 'update'} });
    }


  }
]);