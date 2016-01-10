app.controller('peopleController', ['$scope', 'peopleProvider', '$rootScope', function ($scope, peopleProvider, $rootScope) {
    $scope.people = peopleProvider.people;
    $scope.registerUser = peopleProvider.registerUser;

    //watch for the first person that's added to the collection and auto select them
    var killWatch = $scope.$watchCollection('people', function(newVal){
        if (newVal && newVal.length > 0 && !$scope.initialSelected){
            $rootScope.selectedPerson = $scope.people[0];
            killWatch();
        }
    });
}]);