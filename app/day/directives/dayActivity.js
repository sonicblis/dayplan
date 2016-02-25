app.directive("dayActivity", function () {
    return {
        restrict: 'E',
        templateUrl: 'app/day/directives/dayActivity.html',
        scope: {
            activity: '='
        },
        controller: ['$scope', '$rootScope', 'activityProvider', 'logProvider', 'taskSelectionService', function ($scope, $rootScope, activityProvider, logProvider, taskSelectionService) {
            $scope.completeActivity = function(activity){
                logProvider.info('dayActivity', 'Completing an  activity', activity);
                activityProvider.completeActivity(activity);
            };
            $scope.removeActivity = function(activity){
                activityProvider.removeActivity(activity);
            };
            $scope.calculateWidth = function(activity){
                if (activity) {
                    var hours = activity.hours ? parseInt(activity.hours) : 0;
                    var minutes = activity.minutes ? parseInt(activity.minutes) : 0;
                    var total = (hours > 0 || minutes > 0) ? ((((hours * 60) + minutes) / (8 * 60)) * 100) : 0;
                    return (total > 100) ? 100 : total;
                }
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