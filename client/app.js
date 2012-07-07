  var desktop = new Desktop;

var desktop;
var startupApps = [{name: 'decks', type: 'primary'}, {name: 'dock', type: 'dock'}];

Meteor.startup(function(){
  desktop = new Desktop;
  _.each(startupApps, function(app, idx){
    desktop.spawn(app.name, app.type).foreground();
  });
});

Template.hello.greeting = function () {
  return "Welcome to root.";
};

Template.hello.events = {
  'click input' : function (){      
    desktop.spawn('decks');
  }
};