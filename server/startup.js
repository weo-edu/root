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

		var complete_template = 
			"<a href='/about/{{user.name}}'><img class='avatar' src='{{avatar}}' /></a>\
			<div class='info'>\
      <h5 class='username'> <a href='/about/{{user.name}}'>{{user.name}}</a>&nbsp;</h5>\
      <span class='verb'>played</span>\
      <a class='object' href='/{{app}}{{render.deck_url}}'>{{render.deck_title}}</a>\
      <span>against</span>\
      <span> <a href='/about/{{render.opponent}}'>{{render.opponent}}</a>&nbsp;</span>\
      <div class='timeAgo'> {{time}} </div>\
    	</div>"
		Actions.update(
			{name: 'complete'}, 
			{$set: {'template.game': complete_template}
		});

	});

	var connections = {};

	Meteor.userDisconnected(function(userId) {
		connections[userId] && connections[userId]--;
		if (!connections[userId]) {
			Meteor.users.update(userId, {$set: {status: User.STATUS.DISCONNECTED}});
			delete connections[userId];
		}
			
	});

	Meteor.userConnected(function(userId) {
		if (connections[userId])
			connections[userId]++;
		else {
			connections[userId] = 1;
			Meteor.users.update(userId, {$set: {status: User.STATUS.CONNECTED}});
		}
	});

	Meteor.users.update({$ne: {status: User.STATUS.DISCONNECTED}}, {$set: {status: User.STATUS.DISCONNECTED}});
})();