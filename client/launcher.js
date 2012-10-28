Launcher = {
  startupApps: [{name: 'home', type: 'primary'}, {name: 'dock', type: 'dock'}],
  start: function() {
    _.each(this.startupApps, this.run.bind(this));
  },
  launch: function (url) {
    var name = utils.getAppFromPath(url);
    var path = url.replace('/' + name, '');
    return this.run({name: name, type: 'primary', path: path}, true);
  },
  run: function(app, forceFore) {
    var self = this;
    var pane = Desktop.spawn(app.name, app.type, app.path, function(process) {
      purl(process);
      process.on('purl:app', function(url) {
        route(url.replace(__meteor_runtime_config__.METEOR_SUBAPP_PREFIX, 'sub!'));
      });
      process.on('purl:host', function(url) {
        window.open(url);
      });
    });

    if(!Desktop.foreground(pane.type) || forceFore)
      pane.foreground();

    Meteor.defer(redoLayout);
    return pane;
  }
};

User.on('logout', function() {
  Desktop.destroyPanes();
  Launcher.run({name: 'app!home', type: 'primary'});
})

route('/sub!*', route.publicize, function(ctx, next){
  var pane = Launcher.launch(ctx.path.replace('sub!', __meteor_runtime_config__.METEOR_SUBAPP_PREFIX));
  var child_window = pane.process.window();
  var path = child_window.route && child_window.route.path();
  //pane may chose to go to different path 
  //change path to reflect child path
  if ('/' + ctx.path.split('/').slice(2).join('/') !== path && path) {
    ctx.path += path;
    ctx.state.path = ctx.path;
    ctx.canonicalPath = ctx.path;
  }
});

Meteor.startup(function() {
  Launcher.start();
});

function redoLayout() {
 //XXX this is elliots beard janks
  if (! Meteor.user()) {
    $('#dock').hide();
    $('#primary').css({bottom: 0, height: '100%'});
  } else {
    $('#dock').show();
    Desktop.layout();
  }
}

$(window).resize(function() {
  Desktop.layout();
  redoLayout();
});