if (Meteor.is_client) {

  Meteor.defer(function(){
    process.fork_child('/app!dock');
  });
}

if (Meteor.is_server) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}