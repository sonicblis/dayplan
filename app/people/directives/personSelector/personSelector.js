app.directive("personSelector", function () {
    return {
        restrict: 'E',
        scope: {
            ngModel: '=',
            selectionProperty: '@'
        },
        templateUrl: 'app/people/directives/personSelector/personSelector.html',
        controller: ['$scope', 'peopleProvider', function ($scope, peopleProvider) {
            $scope.people = peopleProvider.people;
            $scope.ngModel = $scope.ngModel || []
            $scope.selectionProperty = $scope.selectionProperty || '$selectedBy' + $scope.$id;
            $scope.togglePerson = function(person){
                $scope.ngModel = $scope.ngModel || [];
                if ($scope.ngModel.indexOf(person.$id) > -1){
                    $scope.ngModel.splice($scope.ngModel.indexOf(person.$id),1);
                    person[$scope.selectionProperty] = false;
                }
                else{
                    $scope.ngModel.push(person.$id);
                    person[$scope.selectionProperty] = true;
                }
            }
        }],
        link: function (scope, el, attrs) {
        }
    }
});