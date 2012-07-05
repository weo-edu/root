if (Meteor.is_client) {
  Template.hello.greeting = function () {
    return "Welcome to root.";
  };

  var decks;
  Template.hello.events = {
    'click input' : function () {
      // template data, if any, is available in 'this'
      if(decks)
        decks.destroy();
      
      process.fork_child('/app!decks')
    }
  };
}

if (Meteor.is_server) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}