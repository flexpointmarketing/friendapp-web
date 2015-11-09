if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {};
		F.prototype = obj;
		return new F();
	};
}

(function($, window, document, undefined) {
	var FriendApp = {
		init: function(data) {
			console.log(data);
			
			var self = this;			
			self.data = data;
			self.appHeader = $('div.frapp-container header.header');
			
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
