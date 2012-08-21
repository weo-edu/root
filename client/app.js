var startupApps = [{name: 'home', type: 'primary'},  {name: 'dock', type: 'dock'}];

route('/sub!*', function(ctx){
  $(function(){
    launch(ctx.path.replace('sub!', __meteor_runtime_config__.METEOR_SUBAPP_PREFIX));
  });

});

$(window).resize(function(){
  Desktop.layout();
});


function openHost(url){
  window.open(url);
}

function launch(url){
  var name = utils.getAppFromPath(url);
  var path = url.replace('/' + name, '');
  run({name: name, type: 'primary', path: path});
}

function run(app){
    var pane = Desktop.spawn(app.name, app.type, app.path).foreground();
    purl(pane.process);
    pane.process.on('purl:app', launch);
    pane.process.on('purl:host', openHost);
}

function runStartups(){
  _.each(startupApps, run);
}

Meteor.startup(function(){
 // Meteor.defer(runStartups);
 runStartups();
 route.start();
});

Template.hello.greeting = function () {
  return "Welcome to root.";
};

Template.hello.events = {
  'click input' : function (){      
    desktop.spawn('decks');
  }
};
