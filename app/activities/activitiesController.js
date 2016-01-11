app.controller('activitiesController', ['$scope', 'activityProvider', '$rootScope', 'logProvider', function($scope, activityProvider, $rootScope, logProvider){
    $scope.dayActivities = activityProvider.activities;
    $scope.dayAndUserFilter = function(){
        return function(activity){
            return activityProvider.activityIsForDay(activity) && activity.user == $rootScope.selectedPerson.$id;
        }
    };

    logProvider.info('dayActivity', 'Selected Date is set to', $rootScope.selectedDate);
    if (!$rootScope.selectedDate){
        logProvider.info('dayActivity', 'Setting default selected date to now');
        $rootScope.selectedDate = new Date();
        logProvider.info('dayActivity', 'Checking if we have a selected person to reconcile', $rootScope.selectedPerson);
        if ($rootScope.selectedPerson) {
            activityProvider.reconcileDaysActivities($rootScope.selectedDate);
        }
    };
}]);