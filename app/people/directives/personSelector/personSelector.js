app.directive("personSelector", function () {
    return {
        restrict: 'E',
        scope: {
            ngModel: '='
        },
        templateUrl: 'app/people/directives/personSelector/personSelector.html',
        controller: ['$scope', 'peopleProvider', function ($scope, peopleProvider) {
            $scope.people = peopleProvider.people;
            $scope.ngModel = $scope.ngModel || [];
            $scope.togglePerson = function(person){
                if ($scope.ngModel.indexOf(person.$id) > -1){
                    $scope.ngModel.splice($scope.ngModel.indexOf(person.$id),1);
                    person.$picked = false;
                }
                else{
                    $scope.ngModel.push(person.$id);
                    person.$picked = true;
                }
            }
        }],
        link: function (scope, el, attrs) {

        }
    }
});