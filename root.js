if (Meteor.is_client) {
  console.log('fork',process);
  Meteor.defer(function() {
    purl.initRoot();
    var child = process.fork('/app!purl-test');
    $('body').append(child.iframe);
    purl.proxy(child);
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