var app = angular.module('dayPlan', ['firebase', 'ui.sortable']);
app.run(['logProvider', function(logProvider){
    logProvider.setLoggingLevels({
        warn: true,
        error: true,
        debug: false,
        info: true
    });
}]);