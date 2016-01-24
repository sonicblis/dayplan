app.directive("activity", function () {
    return {
        restrict: 'E',
        scope:{
            activity: '=ngModel',
            onEdit: '&',
            onAdd: '&'
        },
        templateUrl: 'app/activities/directives/activity/activity.html',
        controller: ['$scope', 'taskSelectionService', function ($scope, taskSelectionService) {
            $scope.taskSelectionService = taskSelectionService;
            $scope.selectTask = function(task){
                taskSelectionService.selectTask(task);
            };
        }],
        link: function (scope, el, attrs) {

        }
    }
});