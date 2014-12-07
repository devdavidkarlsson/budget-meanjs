'use strict';

(function() {
	// Incomes Controller Spec
	describe('Incomes Controller Tests', function() {
		// Initialize global variables
		var IncomesController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Incomes controller.
			IncomesController = $controller('IncomesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Income object fetched from XHR', inject(function(Incomes) {
			// Create sample Income using the Incomes service
			var sampleIncome = new Incomes({
				name: 'New Income'
			});

			// Create a sample Incomes array that includes the new Income
			var sampleIncomes = [sampleIncome];

			// Set GET response
			$httpBackend.expectGET('incomes').respond(sampleIncomes);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.incomes).toEqualData(sampleIncomes);
		}));

		it('$scope.findOne() should create an array with one Income object fetched from XHR using a incomeId URL parameter', inject(function(Incomes) {
			// Define a sample Income object
			var sampleIncome = new Incomes({
				name: 'New Income'
			});

			// Set the URL parameter
			$stateParams.incomeId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/incomes\/([0-9a-fA-F]{24})$/).respond(sampleIncome);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.income).toEqualData(sampleIncome);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Incomes) {
			// Create a sample Income object
			var sampleIncomePostData = new Incomes({
				name: 'New Income'
			});

			// Create a sample Income response
			var sampleIncomeResponse = new Incomes({
				_id: '525cf20451979dea2c000001',
				name: 'New Income'
			});

			// Fixture mock form input values
			scope.name = 'New Income';

			// Set POST response
			$httpBackend.expectPOST('incomes', sampleIncomePostData).respond(sampleIncomeResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Income was created
			expect($location.path()).toBe('/incomes/' + sampleIncomeResponse._id);
		}));

		it('$scope.update() should update a valid Income', inject(function(Incomes) {
			// Define a sample Income put data
			var sampleIncomePutData = new Incomes({
				_id: '525cf20451979dea2c000001',
				name: 'New Income'
			});

			// Mock Income in scope
			scope.income = sampleIncomePutData;

			// Set PUT response
			$httpBackend.expectPUT(/incomes\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/incomes/' + sampleIncomePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid incomeId and remove the Income from the scope', inject(function(Incomes) {
			// Create new Income object
			var sampleIncome = new Incomes({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Incomes array and include the Income
			scope.incomes = [sampleIncome];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/incomes\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleIncome);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.incomes.length).toBe(0);
		}));
	});
}());