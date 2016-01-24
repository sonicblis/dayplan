app.directive("message", function () {
    return {
        restrict: 'E',
        templateUrl: 'app/messaging/directives/message/message.html',
        scope: {
            message: '=ngModel'
        },
        controller: ['$scope', 'messageProvider', function ($scope, messageProvider) {
            $scope.removeMessage = function(message) {
                messageProvider.removeMessage(message);
            };
        }],
        link: function (scope, el, attrs) {

        }
    }
});