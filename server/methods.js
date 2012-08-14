(function() {
var ss = __meteor_bootstrap__.require('super-sockets'),
	sock = ss.socket('emitter');


var methods = {};

Rfeed = new Meteor.Edis('rfeed');
Pfeed = new Meteor.Edis('pfeed');
Event = new Meteor.Edis('event');
Listeners = new Meteor.Edis('listeners');

Meteor.publish('pfeed',function(user_id) {
  return Pfeed.watch(user_id);
});
Meteor.publish('rfeed',function(user_id) {
	return Rfeed.watch(user_id);
});

methods['/rfeed/handled'] = function(id){
	var self = this;
	var docs = Meteor.Edis.lrange('rfeed:' + self.userId(), 0, -1);
	var idx = 0;
	docs = _.find(docs, function(doc, idx){ 
		doc = JSON.parse(doc);
		if(doc._id === id){
			doc.object.handled = true;
			Meteor.Edis.lset('rfeed:' + self.userId(), idx, JSON.stringify(doc));
			return true;
		}
		idx++;
	});
}

/**
 * adds user as listener of object
 * 
 * @param {string} user
 * @param {string> object
 */

 methods.addListener = function(user, object) {
 	Listeners.sadd(user, object);
 }

/**
 * removes user as listener of object
 * 
 * @param {string} user
 * @param {string} object
 */

methods.removeListener = function(user, object) {
	Listeners.srem(user, object);
}

methods.registerAction = function(action) {
		//action._id = action.name;
		Actions.insert(action);
}

/**
 * push event to all listeners
 * 
 * @param {object} e
 */

 methods.pushEvent = function(e) {
 	e._id = Meteor.uuid();
 	e.user = {
 		_id: this.user()._id,
 		name: this.user().username
 	};
 	e.time = Date.now();

 	var self = this
 		, se = JSON.stringify(e)
 		, multi
 		, res;

 	if(e.persist){
 		if(e.action.name === 'message'){
 			var listeners = e.object.to;
 		}
 		else{
	  		multi = Listeners.multi();
		 	multi.smembers(e.user._id);
		 	if(e.object._id)
		 		multi.smembers(e.object._id);

		 	res = multi.exec();
		 	var listeners = res[0].concat(res[1] || []);
		}

	 	multi = Meteor.Edis.multi()
	 	// add to listener feeds
		_.each(listeners, function(l){ multi.rpush(Rfeed.key(l), se); });

		multi.rpush(Pfeed.key(e.user._id),se);
		multi.rpush('events', se);
		multi.exec();
	}

	var name = e.action.name;
	if(e.object.type)
		name += ':' + e.object.type;
	sock.emit(name, e);
}

var limit = 50;
function flush_redis(){
	if(!Meteor.users)
		return;

	var users = Meteor.users.find({}).fetch();
	users && _.each(users, flush_user_feeds);
	flush_feed('events');
}

var user_feeds = ['pfeed', 'rfeed'];
function flush_user_feeds(user){
	feeds = _.map(user_feeds, function(feed){ return feed + ':' + user._id; });
	_.each(feeds, flush_feed);
}

function flush_feed(id){
	var len = Meteor.Edis.llen(id);
	if(len > (2*limit)){
		var newzero = len - limit;
		var reply = Meteor.Edis.lrange(id, 0, newzero);
		reply = _.map(reply, function(val){ return JSON.parse(val); });

		Meteor.Edis.ltrim(id, newzero, -1);
		Meteor._RemoteCollectionDriver.mongo.db.collection(id, function(err, collection){
			if(err) throw err;

			var record = {
				start: reply[0].time,
				end: reply[reply.length-1].time,
				events: reply
			};

			collection.insert(record);
		});
	}	
}

methods.pages = function(name, id, start, end, feed_id){
	var reply = Meteor.Edis.instances[name].lrange(id, 0, -1);
	var self = this;

	if(reply.length > 0){
		_.each(reply, function(val, idx){
			reply[idx] = JSON.parse(val);
		});

		if(start < reply[0].time){
			if(end > reply[0].time)
				end = null;

			Meteor._RemoteCollectionDriver.mongo.db.collection(name + ':' + id, function(err, collection){
				var query = {end: {$gte: start}};

				if(end){
					query.start = {$lte: end};
				}
				collection.find(query).toArray(function(err, pages){
					if(err) throw err;

					var sub = self.sub(feed_id);
					_.each(pages, function(page, idx){
						_.each(page.events, function(event, idx){
							sub.set(name, event._id, event);
						});
					});
					sub.flush();
				});

			});
		}
	}
}

var flusher;
function StartFlusher(interval){
	interval = interval || 3000;
	flusher = Meteor.setInterval(flush_redis, interval);
}

function StopFlusher(){
	flusher && Meteor.clearTimeout(flusher);
	flusher = null;
}

Edis.start = function(options){
	options = options || {};
	StartFlusher(options.flush_interval);
	Meteor.methods(methods);
	sock.bind(options.port || 5000);
}

Edis.stop = function(){
	sock.close();
	StopFlusher();
	_.each(methods, function(val, key){
		if(Meteor.methods[key])
			delete Meteor.methods[key];
	});
}

Observer.start();
Observer.on('friend:user', function(e){
	Fiber(function(){
		Meteor.call('addListener', e.user._id, e.object._id);
	}).run();
});

Observer.on('unfriend:user', function(e){
	Fiber(function(){
		Meteor.call('removeListener', e.user._id, e.object._id);
	}).run();
})

})();