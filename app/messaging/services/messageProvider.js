app.service('messageProvider', ['firebase', 'logProvider', 'firebaseArrayWatcher', function(firebase, logProvider, firebaseArrayWatcher){
    this.sendMessage = function(message){
        logProvider.info('messageProvider', 'Sending a message', message);
        message.from = firebase.cleanAngularObject(message.from);
        message.to.forEach(function(to){
            firebase.messages.push({from: message.from, to: to, text: message.text});
        });
    };
    this.removeMessage = function(message){
        firebase.messages.child(message.$id).remove();
    };
    this.messages = firebaseArrayWatcher.getWatcher(firebase.messages);
}]);