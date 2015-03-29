'use strict';
angular.module('carsApp')
	.factory('DataFactory', ['$http', function($http){
		return function(url) {
			var data = $http.get(url)
			.success(function(data) {
				data = d3.csv.parse(data);
			})
			.error(function(data) {
				console.error(status);
			})
		return data;
		}
	}]);