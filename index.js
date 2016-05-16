var express 		= require('express')
,	pug				= require('pug')
,	sass			= require('node-sass')
,   sassMiddleware	= require('node-sass-middleware')
,	errorhandler	= require('errorhandler')
,	morgan 			= require('morgan');

var app = express();

if ('development' == app.get('env')) {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'pug');
	app.use(sassMiddleware({
		src: __dirname + '/sass',
		dest: __dirname + '/public',
		debug: true,
		outputStyle: 'extended'
	}));
	app.use(express.static(__dirname + '/public'));
	app.use(errorhandler({ dumpExceptions: true, showStack: true })); 
	app.use(morgan('combined'));
}

if ('production' == app.get('env')) {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'pug');
	app.use(sassMiddleware({
		src: __dirname + '/sass',
		dest: __dirname + '/public',
		debug: false,
		outputStyle: 'compressed'
	}));
	app.use(express.static(__dirname + '/public'));
	app.use(morgan('combined'));
}

app.get('/', function (req, res) {
	res.render('index', {
		title: 'Hello World'
	});
});

var listener = app.listen(8080, function () {
	console.log('Example app listening on port ' + listener.address().port + ' in ' + process.env.NODE_ENV + ' mode.');
});