app.directive("personSelector", function () {
    return {
        restrict: 'E',
        scope: {
            people: '=options',
            ngModel: '='
        },
        templateUrl: 'app/people/directives/personSelector/personSelector.html',
        controller: ['$scope', function ($scope) {
            $scope.togglePerson = function(person){
                if (!$scope.ngModel){
                    $scope.ngModel = [];
                }
                if ($scope.ngModel.indexOf(person) > -1){
                    $scope.ngModel.splice($scope.ngModel.indexOf(person),1);
                    person.$selected = false;
                }
                else{
                    $scope.ngModel.push(person);
                    person.$selected = true;
                }
            }
        }],
        link: function (scope, el, attrs) {

        }
    }
});