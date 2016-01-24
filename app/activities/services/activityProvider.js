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

            //clean up old completed tasks
            _this.activities.forEach(function(activity){
                logProvider.debug('activityProvider', 'checking for old done activity', activity);
                if (_this.activityIsDoneAndOld(activity)){
                    logProvider.debug('activityProvider', 'activity is old and done, removing it', activity);
                    _this.deleteCompletedDayActivity(activity);
                }
            });
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
                            _this.addActivity(potentialActivity, true);
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
            hours: activity.hours,
            minutes: activity.minutes,
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
        return activityDate.getFullYear() <= dateToCheck.getFullYear() &&
            activityDate.getDate() <= dateToCheck.getDate() &&
            activityDate.getMonth() <= dateToCheck.getMonth();
    };
    this.saveTask = function(task){
        if (!task.$id){
            firebase.tasks.push(firebase.cleanAngularObject(angular.copy(task)));
        }
        else{
            firebase.tasks.child(task.$id).set(firebase.cleanAngularObject(angular.copy(task)));
        }
        _this.reconcileDaysActivities();
    };
    this.completeActivity = function(activity){
        var sourceTask = _this.potentialActivities.find(function(task){
            return task.$id == activity.sourceTask;
        });
        logProvider.info('activityProvider', 'Using source task for completion tracking', sourceTask);
        if (sourceTask.hours > 0 || sourceTask.minutes > 0){
            logProvider.info('activityProvider', 'Source task has hours. Tracking...');
            var activityHistoryPath = firebase.stringify(firebase.activityHistory, sourceTask.$id);
            var activityMinutes = parseInt(sourceTask.hours) * 60 + parseInt(sourceTask.minutes);
            var now = new Date();
            var totals = {
                minutesThisWeek: !activity.completed ? activityMinutes : 0,
                lastUpdate: new Date().getTime(),
                minutesThisMonth: !activity.completed ? activityMinutes : 0,
                minutesThisYear: !activity.completed ? activityMinutes : 0,
                minutesTotal: !activity.completed ? activityMinutes : 0
            };
            var updates = {};

            //update the task
            var activityCompletionPath = firebase.stringify(firebase.activities, activity.$id, 'completed');
            updates[activityCompletionPath] = !activity.completed;

            //update the history to track execution
            firebase.activityHistory.child(sourceTask.$id).once(firebase.events.valueChanged, function(historyItem){
                logProvider.info('activityProvider', 'History item retrieved', historyItem.val());
                historyItem = historyItem.val();
                if (historyItem){
                    var lastUpdate = new Date(historyItem.lastUpdate);
                    if (!activity.completed)
                        totals.minutesTotal += historyItem.minutesTotal;
                    else
                        totals.minutesTotal = historyItem.minutesTotal - activityMinutes;

                    //check if minutes need to be rolled over
                    if (lastUpdate.getFullYear() == now.getFullYear()){
                        if (!activity.completed)
                            totals.minutesThisYear += historyItem.minutesThisYear;
                        else
                            totals.minutesThisYear = historyItem.minutesThisYear - activityMinutes;

                        if (lastUpdate.getMonth() == now.getMonth()){
                            if (!activity.completed)
                                totals.minutesThisMonth += historyItem.minutesThisMonth;
                            else
                                totals.minutesThisMonth = historyItem.minutesThisMonth - activityMinutes;
                        }
                    }
                    if (lastUpdate.getDay() >= now.getDay()){
                        if (!activity.completed)
                            totals.minutesThisWeek += historyItem.minutesTotal;
                        else
                            totals.minutesThisWeek = historyItem.minutesTotal - activityMinutes;
                    }
                }
                updates[activityHistoryPath] = totals;
                firebase.root.update(updates);
            });
        }
        else {
            logProvider.info('activityProvider', 'No hours to track.  Completing activity.');
            firebase.activities.child(activity.$id).child('completed').set(!activity.completed);
        }
    };
    this.activityIsDoneAndOld = function(activity){
        var activityDate = new Date(activity.forDate);
        return activityDate.getFullYear() <= $rootScope.selectedDate.getFullYear() &&
            (
                activityDate.getFullYear() < $rootScope.selectedDate.getFullYear() ||
                activityDate.getDate() < $rootScope.selectedDate.getDate() ||
                activityDate.getMonth() < $rootScope.selectedDate.getMonth()
            ) &&
            activityDate.getMonth() <= $rootScope.selectedDate.getMonth() &&
            activity.completed == true;
    };
    this.deleteCompletedDayActivity = function(activity){
        if (activity.completed) {
            firebase.activities.child(activity.$id).remove();
            if (activity.sourceTask){
                var sourceTask = _this.tasks.find(function(task){
                    return task.$id == activity.sourceTask;
                });
                if (sourceTask && sourceTask.hidden == true){
                    firebase.tasks.child(sourceTask.$id).remove();
                }
            }
        }
    };
    this.deleteTask = function(task){
        firebase.tasks.child(task.$id).remove();
    };
}]);