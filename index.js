const e = require("express");
var express = require("express");
var app = express();
// Set port for local and deployed
var PORT = process.env.PORT || 8080;

// require the database
var db = require("./models");


// Parse application body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("/public"));

const session = require("express-session");
// Set Handlebars
// var exphbs = require("express-handlebars");
// app.engine("handlebars", exphbs({defaultLayout: "main" }));
// app.set("view engine", "handlebars");

//creates encrypted server-side cookie, stores each user's session data
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { 
      secure: true,
      //expiration date of session in milliseconds (below is 2hrs)
      maxAge:2*60*60*1000
     }
}))

app.get("/", (req, res)=>{
res.send("hello");
})




app.post("/signup", (req, res)=>{
    db.User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }).then(newUser=>{
        res.json(newUser)
    }).catch(err=>{
        console.log(err);
        res.status(500).send("server error")
    })
})

app.post("/login", (req, res)=>{
    db.User.findOne({
        where: {
            email: req.body.email
        }
    }).then(user=>{
        if(!user){
            return req.status(401).send("incorrect email or password")
        }else if(req.body.password === user.password){
            req.session.use = {
                email: user.email,
                id: user.id
            }
           return res.status(200).json(req.session);
        } else{
            return res.status(401).send("incorrect email or password")
        }
    })
})

app.get("/userprofile", (req, res)=>{
    if(req.session.user){
        
        res.send("welcome to your profile");
    } else {
        res.status(401).send("log in first or create an account")
    }
})

app.get("/sessiondata", (req, res)=>{
    res.json(req.session);
})



//continue class video from 25



db.sequelize.sync({ force: false}).then(function() {
    app.listen(PORT, function() {
      console.log("App listening on PORT " + PORT);
    });
  });