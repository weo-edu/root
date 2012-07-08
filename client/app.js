var startupApps = [{name: 'dock', type: 'dock'}, {name: 'decks', type: 'primary'}];


function run(app){
    var pane = Desktop.spawn(app.name, app.type).foreground();
    purl.proxy(pane.process);
    purl.on('app:change', function(url){
      console.log('tried to change path to ' + url.href);
    });
}

function runStartups(){
  purl.initRoot();
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