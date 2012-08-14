;(function(){
	window.eventize = function(){
		this.type = this.type || this.constructor.name;
		var o = {};
		if ('_eventize' in this) {
			o = this._eventize();
		} else {
			for(var i in this){
				if('function' !== typeof this[i]){
					o[i] = this[i];
				}
			}
		}

		var required = ['type','title'];
		console.assert(_.intersection(required,_.keys(o)).length == required.length);	
		return o;
	}

	process.on('fork', function(child){
		child.on('event',function(action, object, adverbs, persist) {
			if(typeof persist === 'undefined')
				persist = true;

			object = object || {name: 'weo', type: 'global', title: 'weo'};
			adverbs = adverbs || [];
			if(typeof adverbs === 'string')
				adverbs = [adverbs];

			action = (action && action.name) || {name: action};
			action.adverbs = adverbs;

			var e = {};
			e.action = Actions.findOne({name: action.name});
			console.assert(e.action);
			e.action = _.extend(e.action, action);
			e.object = (object.eventize && object.eventize()) || eventize.apply(object, []);
			e.persist = persist;

			if (!e.action) throw new Error('event must have action');
			if (!e.object) throw new Error('event must have object');
			Meteor.call('pushEvent',e);
		});
	});

	Meteor.startup(function(){
		var query = {};
		query['action.name'] = 'message';
		query['object.handled'] = false;
		var cursor = Rfeed.find(query, {sort: [['time', 'desc']]});
		cursor.observe({
			added: function(doc, before_index){
				var update = {$set: {}};
				update['$set']['object.handled'] = true;
				Meteor.call('/rfeed/handled', doc._id);
				process.emit('m', doc);
			}
		});
	});

	process.on('user_message', function(e){
		process.emit(e.object.subject, e);
	});

	process.on('request:game', function(e){
		confirm(e.user.name + ' would like to play a game with you');
	});
})();