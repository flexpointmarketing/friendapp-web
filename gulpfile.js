'use strict';

var gulp = require('gulp'),
	nodemon = require('gulp-nodemon'),
	// LiveServer = require('gulp-live-server'),
	browserSync = require('browser-sync'),
	browserify = require('browserify'),
	source = require('vinyl-source-stream'),
	reactify = require('reactify');
	
gulp.task('default', ['browser-sync'], function () {
	// gulp.watch("public/jsx/*.jsx", ['bundle'])	
	// gulp.watch("public/jsx/components/*.jsx", ['bundle']);
	// gulp.watch("public/jsx/*.jsx", ['bundle']);
	// gulp.watch("public/jsx/components/*.jsx", ['bundle']);
	
	// gulp.watch("public/js/*.js").on('change', browserSync.reload);
});

gulp.task('bundle', function() {
	return browserify({
		entries: 'public/jsx/main.jsx',
		debug: true,
	})
	.transform(reactify)
	.bundle()
	.pipe(source('main.js'))
	.pipe(gulp.dest('./public/js'));
});

gulp.task('browser-sync', ['nodemon'], function() {
	browserSync.init(null, {
		proxy: "http://localhost:3000",
        files: [
			"public/**/*.*",
			"views/*.*"
		],
        port: 8000,
	});
});

gulp.task('nodemon', function (cb) {
	
	var started = false;
	
	return nodemon({
		// ignore: ["public/*"],
		script: 'bin/www'
	}).on('start', function () {
		// to avoid nodemon being started multiple times
		if (!started) {
			cb();
			started = true;
		} 
	});
});

// gulp.task('live-server', function() {
// 	var server = new LiveServer('bin/www');
// 	server.start();
// });

// gulp.task('serve', ['bundle', 'live-server'], function() {
// 	browserSync.init(null, {
// 		proxy: "http://localhost:3000",
//         files: [
// 			"public/**/*.*",
// 			"views/*.*"
// 		],
//         port: 8000,
// 	});
// });