var app = angular.module('dayPlan', ['firebase']);
app.run(['logProvider', function(logProvider){
    logProvider.setLoggingLevels({
        warn: true,
        error: true,
        debug: true,
        info: true
    });
}]);