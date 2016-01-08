app.directive("activitySelector", function () {
    return {
        restrict: 'E',
        templateUrl: 'app/activities/directives/activitySelector/activitySelector.html',
        controller: ['$scope', function ($scope) {
            $scope.activities = [
                {name: 'Activity One'},
                {name: 'Activity Two'}
            ];
            $scope.ui = {
                addingTask: false
            };
            $scope.days = [
                {number: 1, name: 'Mon'},
                {number: 2, name: 'Tue'},
                {number: 3, name: 'Wed'},
                {number: 4, name: 'Thu'},
                {number: 5, name: 'Fri'},
                {number: 6, name: 'Sat'},
                {number: 0, name: 'Sun'}
            ];
            $scope.toggleDay = function(day){
                $scope.task.autoDays = $scope.task.autoDays || [];
                var dayIndex = $scope.task.autoDays.indexOf(day);
                if (dayIndex > -1){
                    $scope.task.autoDays.splice(dayIndex, 1);
                    day.$selected = false;
                }
                else{
                    $scope.task.autoDays.push(day);
                    day.$selected = true;
                }
            };
            $scope.task = {category: 1, hours: 0, minutes: 0};
        }],
        link: function (scope, el, attrs) {

        }
    }
});