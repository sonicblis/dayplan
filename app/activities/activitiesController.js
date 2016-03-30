app.controller('activitiesController', ['$scope', 'activityProvider', '$rootScope', 'logProvider', '$filter', 'firebase', function ($scope, activityProvider, $rootScope, logProvider, $filter, firebase) {
	$scope.dayAndUserFilter = function (activity) {
		return activityProvider.activityIsForDay(activity) && activity.user == $rootScope.selectedPerson.$id;
	};

	activityProvider.activitiesLoaded.then(function () {
		$scope.$watchCollection(function () {
			return activityProvider.activities;
		}, function (newVal) {
			if (newVal && newVal.length && newVal.length > 0) {
				var dayActivities = $filter('filter')(newVal, $scope.dayAndUserFilter);
				dayActivities = $filter('orderBy')(dayActivities, 'priority');
				$scope.dayActivities = dayActivities;
			}
		});
		$scope.$watch(function() {
			return $rootScope.selectedPerson.$id;
		}, function(newVal){
			if (newVal) {
				var dayActivities = $filter('filter')(activityProvider.activities, $scope.dayAndUserFilter);
				dayActivities = $filter('orderBy')(dayActivities, 'priority');
				$scope.dayActivities = dayActivities;
			}
		});
	});

	$scope.sortableConfig = {
		axis: 'y',
		stop: function(e, ui){
			var i = 0;
			$scope.dayActivities.forEach(function(activity){
				firebase.activities.child(activity.$id).child('priority').set(i++);
			});
		}
	};

	$scope.selectedDayIsNotToday = function () {
		var now = new Date();
		return !(
			$rootScope.selectedDate.getDate() == now.getDate() &&
			$rootScope.selectedDate.getFullYear() == now.getFullYear() &&
			$rootScope.selectedDate.getMonth() == now.getMonth()
		);
	};
	$scope.goBackInTime = function () {
		$rootScope.selectedDate.setDate($rootScope.selectedDate.getDate() - 1);
	};
	$scope.goForwardInTime = function () {
		$rootScope.selectedDate.setDate($rootScope.selectedDate.getDate() + 1);
		activityProvider.reconcileDaysActivities();
	};
	$scope.selectNow = function () {
		$rootScope.selectedDate = new Date();
	};
	$scope.completed = function (activity) {
		return activity.completed == true;
	};
	logProvider.info('dayActivity', 'Selected Date is set to', $rootScope.selectedDate);
	if (!$rootScope.selectedDate) {
		logProvider.info('dayActivity', 'Setting default selected date to now');
		$rootScope.selectedDate = new Date();
		logProvider.info('dayActivity', 'Checking if we have a selected person to reconcile', $rootScope.selectedPerson);
		if ($rootScope.selectedPerson) {
			activityProvider.reconcileDaysActivities($rootScope.selectedDate);
		}
	}
	;
}]);