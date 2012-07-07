var startupApps = [{name: 'dock', type: 'dock'}, {name: 'decks', type: 'primary'}];


Meteor.startup(function(){
  _.each(startupApps, function(app, idx){
    Desktop.spawn(app.name, app.type).foreground();
  });

  Desktop.on('foreground', function(pane){
  	console.log('new foreground window', pane);
  });

  Desktop.foreground().background().foreground();
});

Template.hello.greeting = function () {
  return "Welcome to root.";
};

Template.hello.events = {
  'click input' : function (){      
    desktop.spawn('decks');
  }
};