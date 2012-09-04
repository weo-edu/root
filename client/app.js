var startupApps = [{name: 'home', type: 'primary'},  {name: 'dock', type: 'dock'}];

route('/sub!*', function(ctx, next) {
  var p = ctx.path.replace('sub!', __meteor_runtime_config__.METEOR_SUBAPP_PREFIX);
  launch(p);
  next();
});

route('*', function(ctx) {
  runStartups();
});

$(window).resize(function() {
  Desktop.layout();
});


function openHost(url) {
  window.open(url);
}

function launch(url) {
  var name = utils.getAppFromPath(url);
  var path = url.replace('/' + name, '');
  run({name: name, type: 'primary', path: path}, true);
}

function run(app, forceFore) {
    var pane = Desktop.spawn(app.name, app.type, app.path);
    if(!Desktop.foreground(pane.type) || forceFore)
      pane.foreground();

    purl(pane.process);
    pane.process.on('purl:app', launch);
    pane.process.on('purl:host', openHost);
}

function runStartups() {
  _.each(startupApps, run);
}

Meteor.startup(function() {
  route.start();
//  Meteor.defer(runStartups);
});