app.controller('peopleController', ['$scope', '$firebaseArray', function ($scope, $firebaseArray) {
    $scope.people = [
        {
            imgPath: "https://lh3.googleusercontent.com/-rUeR1DgW5pE/AAAAAAAAAAI/AAAAAAAAAIY/7C9vqR49C5I/photo.jpg",
            name: 'CJ',
            $selected: true
        },
        {
            imgPath: "https://lh3.googleusercontent.com/-rUeR1DgW5pE/AAAAAAAAAAI/AAAAAAAAAIY/7C9vqR49C5I/photo.jpg",
            name: 'HBJ'
        }
    ]
}]);