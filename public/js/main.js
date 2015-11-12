if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {};
		F.prototype = obj;
		return new F();
	};
}

(function( $ ) {
	var o = $( {} );

	$.each({
		trigger: 'publish',
		on: 'subscribe',
		off: 'unsubscribe'
	}, function( key, val ) {
		jQuery[val] = function() {
			o[key].apply( o, arguments );
		};
	});
})( jQuery );

(function($, window, document, undefined) {
	var FriendApp = {
		init: function(data) {
			console.log(data);

			var self = this;
			self.data = data; // data from FB api
			self.uData = {}; // init user data object
			self.pQuestions = []; // init prepared questions
			self.baseAU = "https://stupideasygames.com/friendapp/api/web/";
			self.appHeader = $('div.frapp-container header.header');
			self.bindEvents();

			self.getPreparedQuestions().then(function(res) {
				self.pQuestions = res;
				self.processData(self);
			});
		},

		bindEvents: function() {
			var self = this;

			$(window).on('hashchange', function() {
				self.render(window.location.hash);
			});
		},

		getUData: function(data) {
			var self = this;

			var async = self.updateUData().then(function(res) {
				self.uData.gameData = res;
				return true;
			});

			return async;
		},

		updateUData: function(data) {
			return this.getUserGameData();
		},

		getPreparedQuestions: function() {
			var self = this;

			return $.ajax({
				url: self.baseAU + 'questions/prepared',
				type: 'GET',
				dataType: 'json'
			});
		},

		processData: function(self) {
			var async = $.when(self.saveUser()).then(function(res) {
				self.showHeaderInfo();
				self.uData.user = res;
			});

			var async2 = async.then(function() {
				return self.getUserGameData();
			});

			var async3 = async2.then(function(res) {
				if (res.list_of_friends.length < 1 &&
					self.data.friends.length > 0) {

					var x = {};
					x.friends = [];

					$.each(self.data.friends, function(index, val) {
						x.friends.push({
							fbid: val.id,
							is_notify: true
						});
					});

					return self.addFriendList(x);
				} else {	
					return res;
				}
			});

			var async4 = async3.then(function(res) {
				self.uData.gameData = res;

				if (res.list_of_friends.length < 1 &&
					self.data.friends.length > 0) {

					var x = {};
					x.friends = [];

					$.each(self.data.friends, function(index, val) {
						x.friends.push({
							fbid: val.id,
							is_notify: true
						});
					});

					return self.updateFriendList(x);
				} else {
					return true;
				}
			});

			async4.then(function(res) {
				console.log(self.uData);
				console.log(self.pQuestions);
				window.location.hash = '#welcome';
				$.publish( 'friendapp/gameLoaderOff');
			});
		},

		showHeaderInfo: function() {
			var self = this;

			var img = self.data.me.picture.data.url;
			var profileH = self.appHeader.find('div.profile-h');
			var avatarH = profileH.find('figure.avatar');

			$('<img></img>', {
				src: img
			}).appendTo(avatarH);
			
			$('<h4></h4>', {
				text: self.data.me.name
			}).appendTo(profileH);
			
			$('<small></small>', {
				text: self.data.me.email
			}).appendTo(profileH);

		},

		saveUser: function() {
			var self = this;

			var o = {
			    name: {
			        first: self.data.me.first_name,
			        last: self.data.me.last_name
			    },
			    username: {
			        email: self.data.me.email,
			        uid: self.data.me.id,
			        type: 'facebook'
			    },
			    image: {
			        original: self.data.me.picture.data.url,
			        thumb: self.data.me.picture.data.url 
			    }
			};

			return $.ajax({
				url: self.baseAU + 'users',
				type: 'POST',
				contentType: 'application/json',
				dataType: 'json',
				data: JSON.stringify(o)
			});
		},

		getUserGameData: function() {
			var self = this;

			return $.ajax({
				url: self.baseAU + 'users/' + self.uData.user._id,
				type: 'GET',
				dataType: 'json'
			});
		},

		addFriendList: function(o) {
			// Add New Friends
			var self = this;
			
			return $.ajax({
				url: self.baseAU + 'users/' + self.uData.user._id,
				type: 'POST',
				contentType: 'application/json',
				dataType: 'json',
				data: JSON.stringify(o)
			}).promise();
		},

		updateFriendList: function(o) {
			// Update friend list of friends also
			var self = this;

			return $.ajax({
				url: self.baseAU + 'users/' + self.uData.user._id,
				type: 'PATCH',
				contentType: 'application/json',
				dataType: 'json',
				data: JSON.stringify(o)
			}).promise();
		},

		render: function(hash) {
			var temp = hash.split('/')[0];

			var	map = {
				'#welcome': function() {
					var el = $('div.page-container');

					el.fadeIn(500);
					el.find('.welcome').delay(500).slideDown(500);
				}
			}

			if (map[temp]) {
				map[temp]();
			}
		}
	}
	
	window.friendapp = Object.create(FriendApp);
	
})(jQuery, window, document);
