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
            var now = new Date();
            var todayIsSelected = (
                $rootScope.selectedDate.getDate() == now.getDate() &&
                $rootScope.selectedDate.getMonth() == now.getMonth() &&
                $rootScope.selectedDate.getFullYear() == now.getFullYear()
            );
            var selectedUserId = $rootScope.selectedPerson.$id;
            var dateAsDate = new Date(date);
            var currentDay = dateAsDate.getDay(); //today's number
            var userPotentialActivities = _this.potentialActivities.filter(function(potentialActivity){
                return potentialActivity.participants.indexOf(selectedUserId) > -1;
            });

            // loop through all activities for all users, delete old completed ones,
            // move forward (update date) all incomplete non-autotask, incomplete auto-task
            // that aren't already in the list with a date today or earlier
            var autoTasksOnTodayList = [];
            _this.activities.forEach(function (activity) {
                activity.$isOld = _this.activityIsOld(activity);

                // REMOVE OLD COMPLETED TASKS
                if (!activity.user || !activity.forDate || (activity.completed && activity.$isOld)) {
                    _this.deleteCompletedDayActivity(activity);
                }

                // MOVE OLD INCOMPLETE TASKS FORWARD
                else if (activity.$isOld){
                    firebase.activities.child(activity.$id).child('forDate').set(now.getTime());
                    autoTasksOnTodayList.push(activity.sourceTask);
                }

                // GET ALL TASKS THAT ARE ON THE SELECTED DAY'S LIST
                else if (_this.activityIsForDay(activity)){
                    autoTasksOnTodayList.push(activity.sourceTask);
                }
            });

            //loop through possible activities and add ones that ain't been added
            userPotentialActivities.forEach(function(potentialActivity){
                if (potentialActivity.autoDays) {
                    if (potentialActivity.autoDays.indexOf(currentDay) > -1) {
                        if (autoTasksOnTodayList.indexOf(potentialActivity.$id) == -1) {
                            _this.addActivity(potentialActivity, true, true);
                        }
                    }
                }
            });
        });
    };
    this.addActivity = function(activity, leaveTask, autoAdded){
        activity.participants.forEach(function(participant){
            firebase.activities.push({
                sourceTask: activity.$id,
                autoAdded: autoAdded ? true : false,
                forDate: $rootScope.selectedDate.getTime(),
                name: activity.name,
                hours: activity.hours,
                minutes: activity.minutes,
                user: participant,
                category: activity.category
            });
        });
        if (!leaveTask){
            logProvider.info('activityProvider', 'Told to hide activity on add, so doing so', activity);
            firebase.tasks.child(activity.$id).update({assigned: true});
        }
    };
    this.removeActivity = function(activity){
        firebase.tasks.child(activity.sourceTask).update({assigned: false});
        firebase.activities.child(activity.$id).remove();
    };

    //used by day list to filter tasks to show that need to be done today
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
        task.hours = (task.hours) ? parseInt(task.hours) : 0;
        task.minutes = (task.minutes) ? parseInt(task.minutes) : 0;
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
    this.activityIsOld = function(activity){
        var activityDate = new Date(activity.forDate);
        var now = new Date();
        logProvider.debug('activityProvider', '    comparing activityDate and rootScope.selectedDate', activityDate);
        return activityDate.getFullYear() <= now.getFullYear() &&
            (
                activityDate.getFullYear() < now.getFullYear() ||
                activityDate.getDate() < now.getDate() ||
                activityDate.getMonth() < now.getMonth()
            ) &&
            activityDate.getMonth() <= now.getMonth();
    };
    this.deleteCompletedDayActivity = function(activity){
        if (activity.completed) {
            firebase.activities.child(activity.$id).remove();
            if (activity.sourceTask){
                var sourceTask = _this.potentialActivities.find(function(task){
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