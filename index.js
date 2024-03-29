var express=require("express");
var bodyParser=require('body-parser');
var app = express();
var connection = require('./config');
var authenticateController=require('./controllers/authenticate-controller');
var registerController=require('./controllers/register-controller');
var session = require('client-sessions');
var edprof =  require('./controllers/editprofile')
var profile = require('./controllers/profile')
var post = require('./controllers/postnew')
var postpage = require('./controllers/postid')
var comment = require('./controllers/comment-controller')
var vote = require('./controllers/vote-controller')
var categ = require('./controllers/categories')
var subscribe = require('./controllers/subscribe-controller')
var home = require('./controllers/home')
var favicon = require('serve-favicon');
var csrf = require('csurf');
var validator = require('express-validator');


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/static'));
app.use(favicon(__dirname +'/img/cr.ico'));
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});
app.use(validator());
app.engine('html', require('ejs').renderFile);
app.use(session({
  cookieName: 'session',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true,
  secure: true,
  ephemeral: true
}));
app.use(csrf());
app.use(function (req, res, next) {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  res.locals.csrftoken = req.csrfToken();
  next();
});
app.use(function(req, res, next) {
  for (var item in req.body) {
    req.sanitize(item).escape();
  }
  next();
});

app.get('/register', function (req, res) {
  if(req.session.user)
  {
    return res.redirect('/home');
  }
   res.render( __dirname + "/templates/" + "reg.html",{message:req.query.message});
})

app.get('/logout',function(req,res){
  req.session.reset()
  return res.redirect('/')
})

app.get('/', function (req, res) {
  if(req.session.user )
  {
    return res.redirect('/home');
  }
   res.render( __dirname + "/templates/" + "login.html" ,{message:req.query.message});
})

app.get('/home',home.feed);

app.get('/profile',profile.profileload);

app.get('/profile/edit',function(req,res){
  if(!req.session.user)
  {
    return res.redirect('/')
  }

  connection.query('SELECT * from user_profile WHERE username =?',[req.session.user],function(error,results,fields)
{
  if(error)
  {
    console.log(error)
  }
  else {
    if(results.length==0)
    {
      res.render(__dirname+"/templates/"+"edit.html",{username:req.session.user,message:req.query.message,fname:'',lname:'',email:'',desc:''});
    }
    else {
      res.render(__dirname+"/templates/"+"edit.html",{username:req.session.user,message:req.query.message,fname:results[0].fname,lname:results[0].lname,email:results[0].email_id,desc:results[0].description});
    }
  }
});
})

app.get('/posts/new',function(req,res){
  if(!req.session.user)
  {
    return res.redirect('/')
  }
  res.render(__dirname+"/templates/"+"newpost.html",{message:req.query.message});
})


app.get('/posts/u/:user',postpage.userpage)
app.get('/posts/p/:postid',postpage.postcreate)
app.get('/c/:cname',categ.homepage);
app.get('/search/',categ.search)

app.post('/controllers/register-controller', registerController.register);
app.post('/controllers/authenticate-controller', authenticateController.authenticate);
app.post('/controllers/editprofile',edprof.edit)
app.post('/controllers/postnew',post.newpost)
app.post('/controllers/comment-controller',comment.newcomment)
app.post('/controllers/vote-controller', vote.newvote)
app.post('/controllers/subscribe-controller', subscribe.newsubscribe)
app.post('/unsubscribe', subscribe.newunsubscribe)

app.listen(8011);
app.use(function (req, res) {
    res.render( __dirname + "/templates/" + "error.html")
});
