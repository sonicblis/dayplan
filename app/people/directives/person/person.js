app.directive("person", function () {
    return {
        restrict: 'E',
        scope: {
            person: '=ngModel'
        },
        templateUrl: 'app/people/directives/person/person.html',
        controller: ['$scope', function ($scope) {

        }],
        link: function (scope, el, attrs) {

        }
    }
});