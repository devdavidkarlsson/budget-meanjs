'use strict';

// Accounts controller
angular.module('accounts').controller('AccountsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Accounts','Expenses','Incomes',
  function($scope, $stateParams, $location, Authentication, Accounts, Expenses, Incomes) {
    $scope.authentication = Authentication;
    var removeTemplate ='<button id="deleteBtn" type="button" class="btn-small" ng-click="getExternalScopes().removeRow(row)">Delete</button> ';

    $scope.show='home';



    //Grid setup
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
      this.accounts = Accounts.query();
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

      $scope.cashflows= [];
      Incomes.query().$promise.then(function(allIncomes){
        allIncomes.forEach(
            function(income){
              if(income.account===accountId){
                getAllCashflowInstances(income).forEach(function(incomeInstance){
                  $scope.cashflows.push(incomeInstance);
                });
              }

            });
      });

      Expenses.query().$promise.then(function(allExpenses){
        allExpenses.forEach(
            function(expense){
              if(expense.account===accountId){
                expense.amount=-expense.amount;
                getAllCashflowInstances(expense).forEach(function(expenceInstance){
                  $scope.cashflows.push(expenceInstance);
                });

              }

            });

        $scope.sumCashflows = 0;

        //should be sorted on date
        $scope.cashflows.sort(function(a, b) {
          return new Date(a.date) - new Date(b.date);
        });

        var graphValues = [];
        $scope.cashflows.forEach(function(flow) {
          graphValues.push([new Date(flow.date),flow.amount]);
          $scope.sumCashflows += Number(flow.amount);
        });


        var sum = {};
        var i;
        for (i = 0; i < graphValues.length; i++) {
          var key = graphValues[i][0];
          //console.log('key:'+key);

          var oldSum = sum[key];
          if (typeof oldSum === 'undefined') {
            oldSum = 0;
          }
          sum[key] = oldSum + Number(graphValues[i][1]);
        }
        console.log(sum);

        var graphSum=[];

        for(key in sum){
          console.log([(key), sum[key]]);
          graphSum.push([(key), sum[key]]);
        };

        console.log(graphSum);
        /*graphValues.forEach(function(obj){
          if(graphValues.indexOf(obj)>0) console.log('');


        });*/

        $scope.graphData=[{"key": "Series 1",
            "values":graphSum}];



        console.log(JSON.stringify($scope.graphData));


      });


      function getAllCashflowInstances(cashflow) {
        var startDate=new Date(cashflow.date),
            currentDate= new Date(),
            cashflows = [];



        if(cashflow.monthly===true){
          while (startDate <= currentDate) {
            var newCashflow = JSON.parse(JSON.stringify(cashflow));
            newCashflow.date=startDate;
            cashflows.push(newCashflow);
            var newDate = new Date(startDate).setMonth(startDate.getMonth() + 1);
            startDate = new Date(newDate);
          }
        }
          return cashflows;
      }


    };

    $scope.xAxisTickFormatFunction = function(){
      return function(d){
        return d3.time.format('%b')(new Date(d));
      }
    }

  }
]);