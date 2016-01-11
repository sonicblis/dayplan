app.directive("activity", function () {
    return {
        restrict: 'E',
        scope:{
            activity: '=ngModel',
            onEdit: '&',
            onAdd: '&'
        },
        templateUrl: 'app/activities/directives/activity/activity.html',
        controller: ['$scope', function ($scope) {

        }],
        link: function (scope, el, attrs) {

        }
    }
});