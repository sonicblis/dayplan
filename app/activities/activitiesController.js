app.controller('activitiesController', ['$scope', 'activityProvider', '$rootScope', 'logProvider', '$filter', function($scope, activityProvider, $rootScope, logProvider, $filter){
    $scope.dayAndUserFilter = function(){
        return function(activity){
            return activityProvider.activityIsForDay(activity) && activity.user == $rootScope.selectedPerson.$id;
        }
    };

    $scope.$watch(function(){return activityProvider.activities;}, function(newVal){
        $scope.dayActivities = $filter('filter')(newVal, $scope.dayAndUserFilter);
    });

    $scope.selectedDayIsNotToday = function(){
        var now = new Date();
        return  !(
            $rootScope.selectedDate.getDate() == now.getDate() &&
            $rootScope.selectedDate.getFullYear() == now.getFullYear() &&
            $rootScope.selectedDate.getMonth() == now.getMonth()
        );
    };
    $scope.goBackInTime = function(){
        $rootScope.selectedDate.setDate($rootScope.selectedDate.getDate() - 1);
    };
    $scope.goForwardInTime = function(){
        $rootScope.selectedDate.setDate($rootScope.selectedDate.getDate() + 1);
        activityProvider.reconcileDaysActivities();
    };
    $scope.selectNow = function(){
        $rootScope.selectedDate = new Date();
    };
    $scope.completed = function(activity){
        return activity.completed == true;
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