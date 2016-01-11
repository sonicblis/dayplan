app.service("activityProvider", ['$q', 'firebase', 'firebaseArrayWatcher', '$rootScope', 'logProvider', function($q, firebase, firebaseArrayWatcher, $rootScope, logProvider){
    var _this = this;
    var activityLoadedPromise = $q.defer();
    var potentialActivitiesPromise = $q.defer();

    this.activitiesLoaded = activityLoadedPromise.promise;
    this.potentialActivitiesLoaded = potentialActivitiesPromise.promise;
    this.everythingLoaded = $q.all([_this.activitiesLoaded, _this.potentialActivitiesLoaded]);

    this.potentialActivities = firebaseArrayWatcher.getWatcher(firebase.tasks, potentialActivitiesPromise);
    this.activities = firebaseArrayWatcher.getWatcher(firebase.activities, activityLoadedPromise);

    //this is the place that potentialActivities are automatically added as
    this.reconcileDaysActivities = function(date){
        _this.everythingLoaded.then(function(){
            logProvider.info('activityProvider', 'Reconciling activities');
            if (!date){
                if (!$rootScope.selectedDate){
                    logProvider.error('activityProvider', 'No date was provided to the reconciler');
                    return;
                }
                else {
                    date = $rootScope.selectedDate;
                }
            }

            var selectedUserId = $rootScope.selectedPerson.$id;
            var dateAsDate = new Date(date);
            var currentDay = dateAsDate.getDay(); //today's number
            var userPotentialActivities = _this.potentialActivities.filter(function(potentialActivity){
                return potentialActivity.participants.indexOf(selectedUserId) > -1;
            });
            var todaysActivitiesForUser = _this.activities.filter(function(activity){
                return _this.activityIsForDay(activity, dateAsDate) && (activity.user == selectedUserId);
            });

            //loop through possible activities and add ones that ain't been added
            userPotentialActivities.forEach(function(potentialActivity){
                if (potentialActivity.autoDays) {
                    if (potentialActivity.autoDays.indexOf(currentDay) > -1) {
                        var existingActivity = todaysActivitiesForUser.find(function (activity) {
                            return activity.sourceTask == potentialActivity.$id;
                        });
                        if (!existingActivity) {
                            firebase.activities.push({
                                sourceTask: potentialActivity.$id,
                                forDate: dateAsDate.getTime(),
                                name: potentialActivity.name,
                                user: selectedUserId,
                                category: potentialActivity.category
                            });
                        }
                        else {
                            firebase.activities.child(existingActivity.$id).update({name: potentialActivity.name});
                        }
                    }
                }
            });
        });
    };
    this.addActivity = function(activity, leaveTask){
        firebase.activities.push({
            sourceTask: activity.$id,
            forDate: $rootScope.selectedDate.getTime(),
            name: activity.name,
            user: $rootScope.selectedPerson.$id,
            category: activity.category
        });
        if (!leaveTask){
            logProvider.info('activityProvider', 'Told to delete activity on add, so doing so', activity);
            firebase.tasks.child(activity.$id).update({assigned: true});
        }
    };
    this.removeActivity = function(activity){
        firebase.tasks.child(activity.sourceTask).update({assigned: false});
        firebase.activities.child(activity.$id).remove();
    };
    this.activityIsForDay = function(activity, dateToCheck){
        if (!dateToCheck){
            dateToCheck = $rootScope.selectedDate;
        }
        var activityDate = new Date(activity.forDate);
        return activityDate.getFullYear() == dateToCheck.getFullYear() &&
            activityDate.getDate() == dateToCheck.getDate() &&
            activityDate.getMonth() == dateToCheck.getMonth();
    };
    this.saveTask = function(task){
        if (!task.$id){
            firebase.tasks.push(firebase.cleanAngularObject(angular.copy(task)));
        }
        else{
            firebase.tasks.child(task.$id).set(firebase.cleanAngularObject(angular.copy(task)));
        }
        _this.reconcileDaysActivities();
    }
    this.completeActivity = function(activity){
        var sourceTask = _this.potentialActivities.find(function(task){
            return task.$id == activity.sourceTask;
        });
        if (sourceTask.hours > 0 || sourceTask.minutes > 0){
            firebase.activityHistory.child(sourceTask.$id).once(firebase.events.valueChanged, function(historyItem){
                var totalMonth = 0,
                    totalYear = 0,
                    totalWeek = 0,
                    total = 0;
                if (historyItem){
                    totalMonth = historyItem.totalMinutesThisMonth;
                    totalYear = hisotryItem.totalMinutesThisYear;
                    totalWeek = historyItem.totalMinutesThisWeek;
                    total = historyItem.totalMinutes;
                }
                var updates = {};
                activity.complete = true;
                updates[firebase.stringify(firebase.activities), activity.$id] = firebase.cleanAngularObject(activity);
                updates[firebase.stringify(firebase.activityHistory), activity.sourceTask, 'totalMinutesThisMonth'] = 0;
                updates[firebase.stringify(firebase.activityHistory), activity.sourceTask, 'totalMinutesThisYear'] = 0;
                updates[firebase.stringify(firebase.activityHistory), activity.sourceTask, 'totalMinutesThisWeek'] = 0;
                updates[firebase.stringify(firebase.activityHistory), activity.sourceTask, 'totalMinutes'] = 0;
                firebase.root.update(updates);
            });
        }
        else {
            firebase.activities.child(activity.$id).child('completed').set(true);
        }
    };
}]);