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
        self.launch(url);
      });
      process.on('purl:host', function(url) {
        window.open(url);
      });
    });

    if(!Desktop.foreground(pane.type) || forceFore)
      pane.foreground(); 
  }
};

/*
route('/sub!home', route.publicize, function(ctx, next) {
  $(function() {
    Launcher.launch('/app!home');
  });
});*/

route('/sub!*', route.publicize, function(ctx, next) {
  $(function() {
    Launcher.launch(ctx.path.replace('sub!', __meteor_runtime_config__.METEOR_SUBAPP_PREFIX));
    next();
  });
});

route('*', route.publicize, function(ctx) {
  Launcher.start();
});

$(window).resize(function() {
  Desktop.layout();
});