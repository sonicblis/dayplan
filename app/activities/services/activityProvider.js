app.service("activityProvider", ['firebase', 'firebaseArrayWatcher', function(firebase, firebaseArrayWatcher){
    this.potentialActivities = firebaseArrayWatcher.getWatcher(firebase.tasks);

    this.saveTask = function(task){
        firebase.tasks.push(firebase.cleanAngularObject(angular.copy(task)));
    }
}]);