app.directive("dayActivity", function () {
    return {
        restrict: 'E',
        templateUrl: 'app/day/directives/dayActivity.html',
        scope: {
            activity: '=ngModel'
        },
        controller: ['$scope', function ($scope) {

        }],
        link: function (scope, el, attrs) {

        }
    }
});