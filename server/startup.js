/*
	Startup contains a hodgepodge of things necessary to ensure
	the existence of basic database structure and any other preliminary
	configuration that might be necessary
*/
;(function(){
	Meteor.startup(function(){
		var actions = [
			'user_message', 'friend', 'unfriend', 
			'login', 'logout', 'complete', 
			'create', 'message', 'pet'
		];

		_.each(actions, function(action){
			Meteor.call('registerAction', {name: action});
		});
	});
})();