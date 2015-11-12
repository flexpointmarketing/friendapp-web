$(document).on('ready', function() {
	$.subscribe('friendapp/gameLoaderOn', onShow);
	$.subscribe('friendapp/gameLoaderOff', onHide);

	FB.init({
		appId: "749194561875248",
		frictionlessRequests: true,
		status: true,
		version: 'v2.4'
	});
	
	window.location.hash = "#starting";
	$.publish( 'friendapp/gameLoaderOn');

	FB.Event.subscribe('auth.authResponseChange', onAuthResponseChange);
	FB.Event.subscribe('auth.statusChange', onStatusChange);
});

