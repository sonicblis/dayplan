app.service("taskSelectionService", function(){
    var _this = this;
    this.selectedTask;
    this.delegates = [];
    this.listenForTaskSelection = function(delegate){
        if (_this.delegates.indexOf(delegate) == -1)
            _this.delegates.push(delegate);
    };
    this.selectTask = function(task){
        _this.selectedTask = task;
        _this.delegates.forEach(function(delegate){
            delegate(task);
        });
    };
});