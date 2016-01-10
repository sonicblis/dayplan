app.directive("activitySelector", function () {
    return {
        restrict: 'E',
        templateUrl: 'app/activities/directives/activitySelector/activitySelector.html',
        controller: ['$scope', 'peopleProvider', 'activityProvider', '$rootScope', function ($scope, peopleProvider, activityProvider, $rootScope) {
            $scope.people = peopleProvider.people;
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
            $scope.activities = activityProvider.potentialActivities;
            $scope.toggleDay = function(day){
                $scope.task.autoDays = $scope.task.autoDays || [];
                var dayIndex = $scope.task.autoDays.indexOf(day.number);
                if (dayIndex > -1){
                    $scope.task.autoDays.splice(dayIndex, 1);
                    day.$selected = false;
                }
                else{
                    $scope.task.autoDays.push(day.number);
                    day.$selected = true;
                }
            };
            $scope.newTask = {category: 1, hours: 0, minutes: 0};
            $scope.task = angular.copy($scope.newTask);
            $scope.onlyForSelectedUser = function(){
                return function(activity){
                    return (activity.participants.indexOf($rootScope.selectedPerson.$id) > -1);
                }
            };
            $scope.cancel = function(){
                $scope.ui.addingTask = false;
                $scope.task = angular.copy($scope.newTask);
            };
            $scope.saveTask = function(task){
                if (task.participants.length == 0){
                    alert('Pick someone to participate in this task first');
                }
                else{
                    activityProvider.saveTask(task);
                    $scope.ui.addingTask = false;
                    $scope.task = angular.copy($scope.newTask);
                }
            };
        }],
        link: function (scope, el, attrs) {

        }
    }
});