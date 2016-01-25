app.directive("activitySelector", function () {
    return {
        restrict: 'E',
        templateUrl: 'app/activities/directives/activitySelector/activitySelector.html',
        controller: ['$scope', 'peopleProvider', 'activityProvider', 'messageProvider', '$rootScope', 'taskSelectionService', 'logProvider', function ($scope, peopleProvider, activityProvider, messageProvider, $rootScope, taskSelectionService, logProvider) {
            $scope.newTask = {
                category: 1,
                hours: 0,
                minutes: 0,
                autoDays: []
            };
            $scope.people = peopleProvider.people;
            $scope.ui = {
                addingTask: false,
                category: 1,
                showAutoDay: false
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
            $scope.task = angular.copy($scope.newTask);

            $scope.addTask = function(){
                $scope.ui.addingTask = true;
                $scope.task = angular.copy($scope.newTask);
                $scope.task.category = $scope.ui.category;
                $scope.people.forEach(function(peep){
                    peep.$picked = $rootScope.selectedPerson.$id == peep.$id;
                    if (peep.$picked) {
                        $scope.task.participants = [peep.$id];
                    }
                });
                $scope.days.forEach(function(day){
                    day.$selected = false;
                });
            };
            $scope.addActivity = function(activity, leaveTask){
                logProvider.info('activitySelector', 'Adding activity from task list', [activity, leaveTask]);
                activityProvider.addActivity(activity, leaveTask);
            };
            $scope.edit = function(task){
                $scope.task = task;
                if ($scope.task.autoDays) {
                    $scope.days.forEach(function (day) {
                        day.$selected = task.autoDays.indexOf(day.number) > -1;
                    });
                }
                $scope.people.forEach(function (peep) {
                    if (task.participants) {
                        peep.$picked = task.participants.indexOf(peep.$id) > -1;
                    }
                });
                $scope.ui.addingTask = true;
            };
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
            $scope.toggleAutoDay = function(){
                $scope.ui.showAutoDay = !$scope.ui.showAutoDay;
            };
            $scope.onlyForSelectedUser = function(){
                return function(activity){
                    var shouldShow = !activity.participants || activity.participants.indexOf($rootScope.selectedPerson.$id) > -1 &&
                        activity.category == $scope.ui.category &&
                        !activity.assigned;
                    if (shouldShow){
                        if (!$scope.ui.showAutoDay){
                            shouldShow = !activity.autoDays || activity.autoDays.length == 0;
                        }
                    }
                    return shouldShow;
                }
            };
            $scope.cancel = function(){
                $scope.ui.addingTask = false;
                $scope.ui.confirming = false;
                $scope.task = angular.copy($scope.newTask);
            };
            $scope.saveTask = function(task){
                if (task.participants.length == 0){
                    alert('Pick someone to participate in this task first');
                }
                else{
                    activityProvider.saveTask(task);
                    taskSelectionService.selectTask(task);
                    $scope.ui.addingTask = false;
                    $scope.task = angular.copy($scope.newTask);
                }
            };
            $scope.confirmDelete = function(){
                if (!$scope.ui.confirming){
                    $scope.ui.confirming = true;
                }
                else{
                    $scope.ui.confirming = false;
                }
            };
            $scope.composeMessage = function(){
                $scope.ui.composingMessage = true;
                $scope.message = {from: $rootScope.selectedPerson};
            };
            $scope.sendMessage = function(message){
                messageProvider.sendMessage(message);
                $scope.ui.composingMessage = false;
            };
            $scope.cancelMessage = function(){
                $scope.ui.composingMessage = false;
                $scope.message = {};
            };
            $scope.deleteTask = function(task){
                activityProvider.deleteTask(task);
                $scope.ui.confirming = false;
                $scope.ui.addingTask = false;
            };

            $scope.$watch('selectedPerson', function(newVal){
                logProvider.debug('activitySelector', 'selectedPerson watch fired', newVal);
                if (newVal && newVal.$id){
                    $scope.task.participants = [newVal.$id];
                    $scope.people.forEach(function(peep){
                        peep.$picked = false;
                    });
                    newVal.$picked = true;
                }
            });
        }],
        link: function (scope, el, attrs) {

        }
    }
});