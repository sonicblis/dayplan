app.service('peopleProvider', ['firebase', 'firebaseArrayWatcher', 'logProvider', '$rootScope', function(firebase, firebaseArrayWatcher, logProvider, $rootScope){
    _this = this;
    function setUserInfo(authInfo){
        logProvider.info('peopleProvider', 'authInfo provided to setUserInfo', authInfo);
        var userInfo = {
            imgPath: authInfo.google.profileImageURL,
            name: authInfo.google.displayName
        };
        logProvider.info('peopleProvider','userInfo from auth', userInfo);
        firebase.people.child(authInfo.uid).set(userInfo);
    };
    this.people = firebaseArrayWatcher.getWatcher(firebase.people);
    this.registerUser = function(){
        logProvider.info('peopleProvider', 'user being registered');
        firebase.root.unauth();
        firebase.root.authWithOAuthPopup('google', function (error, auth) {
            if (!error){
                logProvider.info('peopleProvider', 'user info retrieved from google', auth);
                setUserInfo(auth);
            }
            else{
                console.error('couldn\'t log the user in', error);
            }
        });
    }
}]);