var startupApps = [{name: 'dock', type: 'dock'}, {name: 'decks', type: 'primary'}];


function run(app){
    var pane = Desktop.spawn(app.name, app.type).foreground();
    var pevents = purl(pane.process);
    pevents.on('app', function(url){
      console.log('tried to change path to ' + url.href);
    });
    pevents.on('path',function(path) {
      purl.show(pane.process);
    })
}

function runStartups(){
  _.each(startupApps, run);
}

Meteor.startup(function(){
 // Meteor.defer(runStartups);
 runStartups();
});

Template.hello.greeting = function () {
  return "Welcome to root.";
};

Template.hello.events = {
  'click input' : function (){      
    desktop.spawn('decks');
  }
};