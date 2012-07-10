if (Meteor.is_client) {

	Meteor.defer(function(){
		fillWindow();
		$(window).resize(fillWindow);
	});

	function fillWindow(){
		$('#primary').height($(window).height() - $('#dock').height());
	}

}

if (Meteor.is_server) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}