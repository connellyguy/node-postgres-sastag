const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');
const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const session = require("express-session");
const { Pool, Client } = require('pg');
const path = require('path');
const app = express();
const createError = require('http-errors');
global.createError = createError;
const moment = require('moment');
moment().format();
global.moment = moment;
const okta = require("@okta/okta-sdk-nodejs");
const ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;
const {getHomePage} = require('./routes/index');
const {getPlayerList} = require('./routes/player-list');
const {getTagPage, tagPlayer} = require('./routes/tag');
const {addPlayerPage, addPlayer, deletePlayer, editPlayer, editPlayerPage} = require('./routes/player-management');
const {getDashboard} = require('./routes/analytics-dashboard');
const {getTimeline, getLongTime, getShortAvg, getMostTag} = require('./routes/db-queries');
const port = 5000;


// create pooled connection to database
const db = new Pool();

// connect to database
db.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.log(err);
    }
    console.log('Connected to database');
});
global.db = db;

// configure nodemailer
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PWD
	}
});
global.transporter=transporter;

// configure middleware
app.set('port', process.env.PORT || port); // set express to use this port
app.set('views', path.join(__dirname,'views')); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
app.use(fileUpload()); // configure fileupload
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  cookie: {expires: new Date(253402300000000)}  // Approximately Friday, 31 Dec 9999 23:59:59 GMT
}));

const oidc = new ExpressOIDC({
  issuer: process.env.OKTA_ORG_URL + '/oauth2/default',
  client_id: process.env.OKTA_CLIENT_ID,
  client_secret: process.env.OKTA_CLIENT_SECRET,
  appBaseUrl: 'http://whoisitsas.com',
  scope: 'openid profile',
});

// ExpressOIDC will attach handlers for the /login and /authorization-code/callback routes
app.use(oidc.router);

// load user info to local
app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }
  oktaClient.getUser(req.userinfo.sub)
    .then(user => {
      req.user = user;
      res.locals.user = user;
      next();
    }).catch(err => {
      next(err);
    });
});

// function to require login
function loginRequired(req, res, next) {
    if (typeof req.userContext === 'undefined') {
      return next(createError(401, 'Unauthorized: User is not logged in'));
    }
    next();
}

// function checks if currently logged in player is IT
function isPlayerIt(req, res, next) {
  if (typeof req.userContext === 'undefined') {
    return next(createError(401, 'Unauthorized: User is not logged in'));
  } else {

    const query = "SELECT * FROM v_last_tag;";
    let login_username = req.userContext.userinfo.preferred_username

    db.query(query, (err, result) => {
      if (err) {
        return next(createError(500, err));
      }
      player=result.rows[0];
      if ((player.tagee_email_address.toLowerCase() !== login_username.toLowerCase()) && (login_username.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase())) {
          return next(createError(401, 'Unauthorized: You are not IT!'));
      } else {
        next();
      }
    });
  }
}

// function checks if user is trying to access their own page
function isPlayerCurrentId(req, res, next) {
  if (typeof req.userContext === 'undefined') {
    return next(createError(401, "Unauthorized: User is not logged in"));
  } else {

    let playerId = req.params.id;
    let login_username = req.userContext.userinfo.preferred_username

    const query = { 
      text: "SELECT * FROM users WHERE id = $1;", 
      values: [playerId]
    };

    db.query(query, (err, result) => {
      if (err) {
        return next(createError(500,err));
      }
      player=result.rows[0];
      if ((player.email_address.toLowerCase() !== login_username.toLowerCase()) && (login_username.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase())) {
        return next(createError(401, "Unauthorized: You are trying to access someone else's information"));
      } else {
        next();
      }
    });
  }
}


// routes for the app

app.get('/', getHomePage);
app.get('/players', getPlayerList);
app.get('/players/add', loginRequired, addPlayerPage);
app.get('/players/edit/:id', isPlayerCurrentId, editPlayerPage);
// app.get('/players/delete/:id', deletePlayer);
app.get('/tag', isPlayerIt, getTagPage);
app.get('/db/timeline/:timeframe', getTimeline);
app.get('/db/longtime/:timeframe', getLongTime);
app.get('/db/shortavg/:timeframe', getShortAvg);
app.get('/db/mosttag/:timeframe', getMostTag);
app.get('/charts', getDashboard);
app.post('/tag/:id', isPlayerIt, tagPlayer);
app.post('/players/add', loginRequired, addPlayer);
app.post('/players/edit/:id', isPlayerCurrentId, editPlayer);
app.post('/forces-logout', oidc.forceLogoutAndRevoke(), (req, res) => {});

// 404 Handler (runs if page does not match any other routes)
app.use(function(req, res, next){
  return next(createError(404));
});

// Define express errorHandler
app.use(function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  if(typeof req.userContext != 'undefined') {
      res.render('error.ejs', {
        error: err,
        title: 'Welcome to SAS Tag | Error',
        user: req.userContext.userinfo,
      });
  } else {
      res.render('error.ejs', {
        error: err,
        title: 'Welcome to SAS Tag | Error',
      });
  }
});

// set the app to listen on the port
oidc.on('ready', () => {
  app.listen(port, () => console.log(`Connected to authentication server\nServer running on port: ${port}`));
});
 
oidc.on('error', err => {
  console.log('An error occurred while setting up OIDC, during token revokation, or during post-logout handling');
});