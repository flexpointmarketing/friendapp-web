var friendCache = {};
var preloader = $('div.preloader-container');

function onShow() {
	preloader.fadeIn(500);
}

function onHide() {
	preloader.fadeOut(500);
}

function login(callback) {
	FB.login(callback, {
		scope: 'email,public_profile,user_friends'
	});
}

function loginCallback(response) {
	if (response.status != 'connected') {
		top.location.href = 'https://www.facebook.com/appcenter/stupidfriendapp';
	}
}

function onStatusChange(response) {
	if( response.status != 'connected' ) {
		login(loginCallback);
	} else {
		getMe(function() {
			getPermissions(function() {
				if (hasPermission('user_friends')) {
					getFriends(function() {
						friendapp.init(friendCache);
					});
				} else {
					friendapp.init(friendCache);
				}
			});
		});
		
	}
}

function onAuthResponseChange(response) {
	console.log('onAuthResponseChange', response);
}

function getMe(callback) {
	var fields = [
		'id', 'name', 'first_name', 'last_name',
		'email', 'picture.width(120).height(120)'
	];
	
	FB.api('/me', { fields: fields.join() }, function(response) {
		if( !response.error ) {
			friendCache.me = response;
			callback();
		} else {
			console.error('/me', response);
		}
	});
}

function getFriends(callback) {
	var fields = [
		'id', 'name', 'first_name', 'last_name',
		'email', 'picture.width(120).height(120)'
	];
	
	FB.api('/me/friends', { fields: fields.join() }, function(response) {
		if( !response.error ) {
			friendCache.friends = response.data;
			callback();
		} else {
			console.error('/me/friends', response);
		}
	});
}

function getPermissions(callback) {
	FB.api('/me/permissions', function(response) {
		if( !response.error ) {
			friendCache.permissions = response.data;
			callback();
		} else {
			console.error('/me/permissions', response);
		}
	});
}

function hasPermission(permission) {
	for ( var i in friendCache.permissions ) {
		if ( friendCache.permissions[i].permission == permission &&
		friendCache.permissions[i].status == 'granted') 
		return true;
	}
	
	return false;
}



