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
					self.pQuestions = res.data;
					self.tempQuestions = [];
					self.tempAnswered = {};

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

			function btnEvt(selector, evt, callback, context) {
				if (context !== undefined) {
					$(context).on(evt, selector, callback);
				} else {
					$(selector).on(evt, callback);
				}

				return true;
			}

			function inputEvt(selector, evt, callback, context) {
				if (context !== undefined) {
					$(context).on(evt, selector, callback);
				} else {
					$(selector).on(evt, callback);
				}

				return true;
			}

			return {
				hashEvt: hashEvt,
				btnEvt: btnEvt,
				inputEvt: inputEvt
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

		getRandomInt: function (min, max) {
			return Math.floor(Math.random() * (max - min)) + min;
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

			function ajax3() {
				return $.ajax({
					url: 'public/js/templates/pquestions.hbs',
					type: 'GET',
					dataType: 'html',
					success: function (data) {
						self.templates.dashboard = Handlebars.compile(data);
					},
				});
			}

			return $.when(ajax1(), ajax2(), ajax3());
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
				if (res.list_of_friends.length < 1 && self.data.friends.length > 0) {

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

				if (res.list_of_friends.length < 1 && self.data.friends.length > 0) {

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

				if (self.uData.gameData.questions.prepared.length !== 0) {
					window.location.hash = '#dashboard';
				} else {
					window.location.hash = '#welcome';
					$.publish( 'friendapp/gameLoaderOff');
				}
			});
		},

		render: function(hash) {
			var self = this;
			var temp = hash.split('/')[0];

			var map = {
				// start of welcome hash
				'#welcome': function() {
					self.tempAnswered.questions = [];

					for (var i = 0, j = self.pQuestions; i < 10; i++) {
						var a = j.length;
						var b = j.splice(Math.floor(Math.random() * a), 1);
						self.tempQuestions.push(b[0]);
					}

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

							var z = self.tempQuestions.pop();

							var t = self.templates.pquestions({
								id: z._id,
								question: z.question,
								btnLabel: 'Next',
								btnClass: 'next'
							});

							x.prepend(t).delay(100).queue(function() {
								var qc = $('div.welcome-questions .qs-wrapper');
								qc.addClass('scroll-left');

								function pushQuestion() {
									// push question item
									var o = {
										qid: $('div.pq-item-set').data('id'),
										answer: $('div.answer > input').val()
									};
									self.tempAnswered.questions.push(o);
								}

								// trigger click event on enter
								self.bEvt.inputEvt('div.answer > input', 'keydown', function(e) {
									if (e.keyCode == 13) {
										$('div.page-container div.answer button.btn')
										.trigger('click');
									}

								}, 'div.page-container');

								// Add next button event
								self.bEvt.btnEvt('div.answer button.next.btn', 'click', function() {
									var qc = $('div.welcome-questions .qs-wrapper');
									var aInput = qc.find('.answer > input');

									if ($.trim(aInput.val()) === '') {

										aInput.addClass('shake').delay(300).queue(function() {
											$(this).removeClass('shake');
											$(this).dequeue();
										});

									} else {
										var x = $('div.page-container');
										pushQuestion();

										qc.addClass('scroll-bleft').delay(300).queue(function() {
											$('div.welcome-questions').remove();

											if (self.tempQuestions.length == 1) {
												var z = self.tempQuestions.pop();
												var btnLabel = 'Finish';
												var btnClass = 'finish';

												// submit prepared questions
												var spq = function() {
													function xhr() {
														var url = self.baseAU + 'game-data/questions/prepared';
														self.tempAnswered.uid = self.uData.user._id;

														var data = JSON.stringify(self.tempAnswered);

														return $.ajax({
															url: url,
															type: 'PATCH',
															contentType: 'application/json',
															dataType: 'json',
															data: data
														}).promise();
													}

													var qc = $('div.welcome-questions .qs-wrapper');
													var aInput = qc.find('.answer > input');

													if ($.trim(aInput.val()) === '') {
														aInput.addClass('shake').delay(300)
														.queue(function() {
															$(this).removeClass('shake');
															$(this).dequeue();
														});
													} else {
														pushQuestion();

														xhr().then(function(res) {
															self.uData.gameData.questions.prepared = res;

															$.publish('friendapp/gameLoaderOn');
															$('div.page-container').fadeOut(500)
															.delay(500).queue(function() {
																$(this).html('');
																$(this).dequeue();

																window.location.hash = '#dashboard';
															});
															
															console.log(self.uData);
														});
													}
												};

												// add event on after answering all prepared questions
												self.bEvt.btnEvt('div.answer .finish.btn',
													'click', spq, 'div.page-container');

											} else {
												var z = self.tempQuestions.pop();
												var btnLabel = 'Next';
												var btnClass = 'next';
											}
											
											var t = self.templates.pquestions({
												id: z._id,
												question: z.question,
												btnLabel: btnLabel,
												btnClass: btnClass
											});

											x.prepend(t);

											var qc = $('div.welcome-questions .qs-wrapper');
											qc.addClass('scroll-left');

											$(this).dequeue();
										});
									}

								}, 'div.page-container');

								$(this).dequeue();
							});

							$(this).dequeue();
						});
					});
				},
				// End of welcome hash
				
				// Start of dashboard hash
				'#dashboard': function() {
					$.publish('friendapp/gameLoaderOff');
					$('div.page-container').fadeIn(500);
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
		}
	}
	
	window.friendapp = Object.create(FriendApp);
	
})(jQuery, window, document);
