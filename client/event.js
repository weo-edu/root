;(function() {
	window.eventize = function() {
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

	process.on('fork', function(child) {
		child.on('event', dispatch);
	});
	process.on('event', dispatch);

	function dispatch(action, object, options) {
		var persist = options.persist || true;

		object = object || {name: 'weo', type: 'global', title: 'weo'};
		adverbs = options.adverbs || [];
		if(typeof adverbs === 'string')
			adverbs = [adverbs];

		action = (action.name && action) || {name: action};
		action.adverbs = adverbs;

		var e = {};
		e.action = Actions.findOne({name: action.name});
		console.assert(e.action, "Attempted to log unregistered event action");
		e.action = _.extend(e.action, action);
		e.object = (object.eventize && object.eventize()) || eventize.apply(object, []);
		e.persist = persist;
		e.feed = options.feed;
		e.app = options.app;

		if (!e.action) throw new Error('event must have action');
		if (!e.object) throw new Error('event must have object');
		Meteor.call('dispatch', e);
	}

	Meteor.startup(function() {
		var query = {};
		query['action.name'] = 'user_message';
		query['object.handled'] = false;
		var cursor = Mfeed.find(query, {sort: [['time', 'desc']]});
		cursor.observe({
			added: function(doc, before_index) {
				Meteor.call('/mfeed/handled', doc._id);
				process.emit('user_message', doc);
			}
		});
	});

	process.on('user_message', function(e) {
		process.distribute(e.object.subject, e);
		//process.emit(e.object.subject, e);
	});

	process.on('invite:game', function(e) {
		var self = this;

		//	If this is a real request, prompt the user.
		//	Otherwise, it's a request for goat guru and
		//	should be propagated down accordingly
		if(e.user._id !== Meteor.user()._id) {
			var res = confirm(e.user.name + ' would like to play a game with you');
			res && route('/sub!decks/game/' + e.object.body);
		} else {
			process.distribute('guru:invite', e);
		}
	});

	
})();