app.controller('messagesController', ['messageProvider','$scope','$rootScope',function(messageProvider, $scope,$rootScope){
    $scope.messages = messageProvider.messages;
    $scope.forSelectedUser = function(){
        return function(message){
            return message.to == $rootScope.selectedPerson.$id;
        }
    }
}]);