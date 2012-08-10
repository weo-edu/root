Launcher = {
  startupApps: [{name: 'dock', type: 'dock'}, {name: 'purl-test', type: 'primary'}],
  start: function() {
    _.each(this.startupApps, run);
  },
  launch: function (url){
    var name = utils.getAppFromPath(url);
    var path = url.replace('/' + name, '');
    this.run({name: name, type: 'primary', path: path});
  },
  run: function(app) {
    var pane = Desktop.spawn(app.name, app.type, app.path).foreground();
    purl(pane.process);
    pane.process.on('purl:app', launch);
    pane.process.on('purl:host', function(url) {
      window.open(url);
    });
  }
}

route('/sub!*', function(ctx){
  $(function(){
    Launcher.launch(ctx.path.replace('sub!', __meteor_runtime_config__.METEOR_SUBAPP_PREFIX));
  });

});

$(window).resize(function(){
  Desktop.layout();
});


Meteor.startup(function(){
  Launcher.start();
  route.start();
});

