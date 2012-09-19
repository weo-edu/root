if (Meteor.is_client) {

}

if (Meteor.is_server) {
  Meteor.startup(function() {
  	Edis.start();
    // code to run on server at startup
  });
}