app.service('firebaseArrayWatcher', ['firebase','$firebaseArray',function(firebase, $firebaseArray){
    var watchers = {};
    this.getWatcher = function(firebaseRef, promiseToResolve){
        if (!watchers[firebaseRef]){
            watchers[firebaseRef] = [];
            var fbArray = $firebaseArray(firebaseRef);
            if (promiseToResolve) {
                fbArray.$loaded(function(){
                    promiseToResolve.resolve();
                });
            }
            fbArray.$watch(function(args){
                if (args.event === firebase.events.childAdded){
                    watchers[firebaseRef].push(fbArray.$getRecord(args.key));
                }
                else if (args.event === firebase.events.childRemoved){
                    watchers[firebaseRef].splice(fbArray.indexOf(fbArray.$getRecord(args.key), 1));
                }
            });
        }
        return watchers[firebaseRef];
    }
}]);