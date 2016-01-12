app.directive("dayActivity", function () {
    return {
        restrict: 'E',
        templateUrl: 'app/day/directives/dayActivity.html',
        scope: {
            activity: '=ngModel'
        },
        controller: ['$scope', '$rootScope', 'activityProvider', 'logProvider', function ($scope, $rootScope, activityProvider, logProvider) {
            $scope.completeActivity = function(activity){
                logProvider.info('dayActivity', 'Completing an activity', activity);
                activityProvider.completeActivity(activity);
            };
            $scope.removeActivity = function(activity){
                activityProvider.removeActivity(activity);
            };
        }],
        link: function (scope, el, attrs) {

        }
    }
});