app.controller('activitiesController', ['$scope', 'firebase', '$firebaseArray', function($scope, firebase, $firebaseArray){
    $scope.dayActivities = [
        {
            name: 'Practicode'
        },
        {
            name: 'Move chickens'
        }
    ]
}]);