if (Meteor.is_client) {
  console.log('fork');
  Meteor.defer(function() {
    purl.initRoot();
    purl.proxy(process.fork_child('/app!propurl'));
    purl.on('app:change',function(url) {
    	alert('tried to change path to ' + url.href);
    })

  });
}

if (Meteor.is_server) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}