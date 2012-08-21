Actions = new Meteor.Collection('actions');
if(Meteor.is_server){
	Meteor.publish(null, function(){
		return Actions.find({});
	});
}