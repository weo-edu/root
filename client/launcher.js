Launcher = {
  startupApps: [{name: 'home', type: 'primary'}, {name: 'dock', type: 'dock'}],
  start: function() {
    _.each(this.startupApps, this.run.bind(this));
  },
  launch: function (url) {
    var name = utils.getAppFromPath(url);
    var path = url.replace('/' + name, '');
    this.run({name: name, type: 'primary', path: path}, true);
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

    //XXX this is elliots beard janks
    Meteor.defer(function() {
      if (app.name === 'app!home') {
        $('#dock').hide();
        $('#primary').css({bottom: 0, height: '100%'});
      } else if (app.name.indexOf('!') >= 0){
        $('#dock').show();
        Desktop.layout();
      }
    });
  }
};

User.on('logout', function() {
  Desktop.destroyPanes();
  Launcher.run({name: 'app!home', type: 'primary'});
})


route('/sub!*', route.publicize, function(ctx, next){
  Launcher.launch(ctx.path.replace('sub!', __meteor_runtime_config__.METEOR_SUBAPP_PREFIX));
  next();
});

route('*', route.publicize, function(ctx) {
  Launcher.start();
});

$(window).resize(function() {
  Desktop.layout();
});