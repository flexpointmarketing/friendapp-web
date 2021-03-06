var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var uuid = require('uuid');
var engines = require('consolidate');
var cors = require('cors');

/**
 * MongoDB Connection
 */
var db = mongoose.connect('mongodb://localhost/stea_friendapp');

var app = express();
app.use(cors({
	credentials: true,
	origin: true
}));

app.set('port', process.env.PORT || 3000);

// view engine setup
app.engine('hbs', engines.handlebars);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use(session({
// 	cookie: {
// 		path: '/',
// 		httpOnly: true,
// 		secure: false,
// 		maxAge: 60
// 	},
// 	genid: function(req) {
// 		return uuid.v4();
// 	},
// 	resave: false,
// 	rolling: true,
// 	saveUninitialized: true,
// 	store: new MongoStore({
// 		mongooseConnection: mongoose.connection
// 	}),
// 	secret: '6IRT4hRbpFb3v4xg'
// }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

/**
 * Models
 */
var Questions = require('./models/questions');
var QuizSets = require('./models/quiz-sets');
var Statistics = require('./models/statistics');
var Users = require('./models/users');
var GameData = require('./models/game-data');

/**
 * Routes modules
 */
var routes = require('./routes/index')(Users);
var webApiUsersRoutes = require('./routes/api/web/users')(Users, GameData);
var webApiQuestionsRoutes = require('./routes/api/web/questions')(Questions);
var webApiGameDataRoutes = require('./routes/api/web/game-data')(Users, GameData);

var iosApiUsersRoutes = require('./routes/api/ios/users')(Users, GameData);
var iosApiQuestionsRoutes = require('./routes/api/ios/questions')(Questions);
var iosApiGameDataRoutes = require('./routes/api/ios/game-data')(Users, GameData);
var iosApiStatsGameRoutes = require('./routes/api/ios/stats-game')(Statistics, QuizSets, GameData);

app.use('/', routes);

// Web
app.use('/api/web/users', webApiUsersRoutes);
app.use('/api/web/questions', webApiQuestionsRoutes);
app.use('/api/web/game-data', webApiGameDataRoutes);

// IOS
app.use('/api/ios/users', iosApiUsersRoutes);
app.use('/api/ios/questions', iosApiQuestionsRoutes);
app.use('/api/ios/game-data', iosApiGameDataRoutes);
app.use('/api/ios/stats-game', iosApiStatsGameRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
// 	app.use(function(err, req, res, next) {
// 		res.status(err.status || 500);
// 		res.render('error', {
// 			message: err.message,
// 			error: err
// 		});
// 	});
// }

// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
// 	res.status(err.status || 500);
// 	res.render('error', {
// 		message: err.message,
// 		error: {}
// 	});
// });


module.exports = app;
