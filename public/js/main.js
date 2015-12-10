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
			var self = this;
			self.data = data; // data from FB api
			self.uData = {}; // init user data object
			self.pQuestions = []; // init prepared questions
			self.templates = {}; // init empty templates
			self.baseAU = "https://stupideasygames.com/friendapp/api/web/";
			self.appHeader = $('div.frapp-container header.header');
			self.bEvt = self.bindEvents();
			self.bEvt.hashEvt();
			
			$.when(self.getTemplates(self)).then(function() {
				// get Prepared Questions
				self.getPreparedQuestions().then(function(res) {
					self.pQuestions = res;
					self.processData(self);
				});
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

		bindEvents: function() {
			var self = this;

			function hashEvt() {
				$(window).on('hashchange', function() {
					self.render(window.location.hash);
				});

				return true;
			}

			function btnEvt(selector, evt, callback) {
				$(selector).on(evt, callback);
				return true;
			}

			return {
				hashEvt: hashEvt,
				btnEvt: btnEvt
			}
		},

		getPreparedQuestions: function() {
			var self = this;

			return $.ajax({
				url: self.baseAU + 'questions/prepared',
				type: 'GET',
				dataType: 'json'
			});
		},

		getTemplates: function(self) {
			var x = new $.Deferred();

			function ajax1() {
				return $.ajax({
					url: 'public/js/templates/welcome.hbs',
					type: 'GET',
					dataType: 'html',
					success: function (data) {
						var template = Handlebars.compile(data);
						self.templates.welcome = template({
							name: self.data.me.first_name
						});
					},
				});
			}

			function ajax2() {
				return $.ajax({
					url: 'public/js/templates/pquestions.hbs',
					type: 'GET',
					dataType: 'html',
					success: function (data) {
						self.templates.pquestions = Handlebars.compile(data);
					},
				});
			}

			return $.when(ajax1(), ajax2());
		},

		getUData: function(data) {
			var self = this;

			var async = self.updateUData().then(function(res) {
				self.uData.gameData = res;
				return true;
			});

			return async;
		},

		getUserGameData: function() {
			var self = this;

			return $.ajax({
				url: self.baseAU + 'users/' + self.uData.user._id,
				type: 'GET',
				dataType: 'json'
			});
		},

		processData: function(self) {
			var async = self.saveUser().then(function(res) {
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

		updateUData: function(data) {
			return this.getUserGameData();
		},

		render: function(hash) {
			var self = this;
			var temp = hash.split('/')[0];

			var	map = {
				'#welcome': function() {
					var x = $('div.page-container');
					x.prepend(self.templates.welcome).fadeIn(500);

					y = x.find('div.welcome');
					y.addClass('zoom');

					self.bEvt.btnEvt('#sg-btn', 'click', function() {
						y.removeClass('zoom')
						.addClass('unzoom')
						.delay(500)
						.queue(function() {
							y.remove();

							var t = self.templates.pquestions({
								question: 'My favorite softdrink',
								choice1: 'Mirinda',
								choice2: 'Pepsi',
								choice3: 'Coke',
								choice4: 'Sprite'
							});

							x.prepend(t).fadeIn(100).queue(function() {
								var qc = $('div.welcome-questions');

								qc.addClass('scroll-left')
								.delay(1000).queue(function() {
									qc.addClass('scroll-bleft')
									.delay(500).queue(function() {
										qc.remove();
									});
								});
							});
						});
					});
				}
			}

			if (map[temp]) {
				map[temp]();
			}
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
		}
	}
	
	window.friendapp = Object.create(FriendApp);
	
})(jQuery, window, document);
