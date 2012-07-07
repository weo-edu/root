var startupApps = [{name: 'decks', type: 'dock always_on_top'}, {name: 'decks', type: 'primary'}];

Meteor.startup(function(){
  _.each(startupApps, function(app, idx){
    Desktop.spawn(app.name, app.type).foreground();
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