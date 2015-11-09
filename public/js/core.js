$(document).on('ready', function() {
	FB.init({
		appId: "749194561875248",
		frictionlessRequests: true,
		status: true,
		version: 'v2.4'
	});
	
	FB.Event.subscribe('auth.authResponseChange', onAuthResponseChange);
	FB.Event.subscribe('auth.statusChange', onStatusChange);
});

