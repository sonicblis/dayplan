app.directive("dayActivity", function () {
    return {
        restrict: 'E',
        templateUrl: 'app/day/directives/dayActivity.html',
        scope: {
            activity: '=ngModel'
        },
        controller: ['$scope', '$rootScope', 'activityProvider', 'logProvider', 'taskSelectionService', function ($scope, $rootScope, activityProvider, logProvider, taskSelectionService) {
            $scope.completeActivity = function(activity){
                logProvider.info('dayActivity', 'Completing an activity', activity);
                activityProvider.completeActivity(activity);
            };
            $scope.removeActivity = function(activity){
                activityProvider.removeActivity(activity);
            };
            $scope.calculateWidth = function(activity){
                return (activity.hours > 0 || activity.minutes > 0) ? ((((activity.hours * 60) + activity.minutes) / (8 * 60)) * 100) : 0;
            };
            $scope.selectActivity = function(activity){
                taskSelectionService.selectTask(activity);
            };
            $scope.taskSelectionService = taskSelectionService;
        }],
        link: function (scope, el, attrs) {

        }
    }
});