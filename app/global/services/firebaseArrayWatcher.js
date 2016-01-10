app.service('firebaseArrayWatcher', ['firebase','$firebaseArray',function(firebase, $firebaseArray){
    var watchers = {};
    this.getWatcher = function(firebaseRef){
        if (!watchers[firebaseRef]){
            watchers[firebaseRef] = [];
            var fbArray = $firebaseArray(firebaseRef);
            fbArray.$watch(function(args){
                if (args.event === firebase.events.childAdded){
                    watchers[firebaseRef].push(fbArray.$getRecord(args.key));
                }
                else if (args.event === firebase.events.childRemoved){
                    watchers[firebaseRef].splice(_this.people.indexOf(fbArray.$getRecord(args.key), 1));
                }
            });
        }
        return watchers[firebaseRef];
    }
}]);