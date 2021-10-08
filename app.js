require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");


const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine','ejs');
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


//mongoose.connect("mongodb+srv://admin-partha:"+ atlas.password +"@cluster0.gn61a.mongodb.net/todoDB");
mongoose.connect("mongodb://localhost:27017/todoDB");

const todoSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: [true, "No todo Specified."]
    },
    status: {
        type: String,
        enum: ['active','inactive'],
        default: 'active'
    }
});

const customTodoSchema = new mongoose.Schema ({
    name: String,
    items: [todoSchema]
});

const userSchema = new mongoose.Schema ({
    username: String,
    password: String,
    googleId: String,
    list: [todoSchema],
    custom: [customTodoSchema]
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/todo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

let theme = "dark";

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/todo", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/");
  }
);


app.get("/register",function(req,res){
    res.render("register",{theme: theme});
});
app.post("/register",function(req,res){
    User.register({username: req.body.username}, req.body.password, function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            auth = passport.authenticate("local");
            auth(req, res, function(){
                res.redirect("/");
            });
        }
    });
});

app.get("/login",function(req,res){
    res.render("login",{theme: theme});
});
app.post("/login",function(req,res){
    const userDoc = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.logIn(userDoc,function(err){
        if(err){
            console.log(err);
        }else{
            const auth = passport.authenticate("local");
            auth(req, res, function(){
                res.redirect("/");  
            });
        }
    });
});


app.get("/",function(req,res){ 
    if(req.isAuthenticated()){
        const day = date.getDate();
        User.findById(req.user.id,function(err,user){
            if(err){
                console.log(err);
            }else{
                const todos = user.list
                res.render('todo',{
                    listTitle: day,
                    todos: todos,
                    theme: theme
                });
            }
        });
    }else{
        res.redirect("/login");
    }
});

app.get("/:todoName",function(req,res){
    const customTodoName = _.capitalize(req.params.todoName);
    if(req.isAuthenticated()){
        User.findById(req.user.id,function(err,user){
            if(err){
                console.log(err);
            }else{
                user.custom.forEach(function(custom){
                    if(custom.name === customTodoName){
                        const todos = custom.items;
                        res.render('todo',{
                            listTitle: customTodoName,
                            todos: todos,
                            theme: theme
                        });
                    }
                });  
            }
        });
    }else{
        res.redirect("/login");
    }
    
});

app.post("/",function(req,res){
    const listName = req.body.submit;
    
    const newTodoDoc = {
        name: req.body.newTodo
    };

    if(listName === date.getDate()) {
        User.findById(req.user.id, function(err, user){
            if(err){
                console.log(err);
            }else{
                user.list.push(newTodoDoc);
                user.save(function(){
                    res.redirect("/");
                });  
            }
        });
    } else {
        User.findById(req.user.id, function(err,user){
            if(err){
                console.log(err);
            }else{
                user.custom.forEach(function(custom){
                    if(custom.name === listName){
                        custom.items.push(newTodoDoc);
                        user.save(function(){
                            res.redirect("/" + listName);
                        }); 
                    }
                });
            }
        });
    }  
});

app.post("/delete",function(req,res){
    const listName = req.body.listName;
    const todoId = req.body.todoId;

    if(listName === date.getDate()){
        User.findByIdAndUpdate(req.user.id, {$pull: {list: {_id: todoId}}}, function(err, user){
            if(err){
                console.log(err);
            }else{
                res.redirect("/");
            }
        });
    } else {
        User.findById(req.user.id, function(err,user){
            if(err){
                console.log(err);
            }else{
                user.custom.forEach(function(custom){
                    if(custom.name === listName){
                        custom.items = custom.items.filter(item => item._id.valueOf() !== todoId);
                        user.save(function(){
                            res.redirect("/" + listName);
                        });
                    }
                });
            }
        });
    } 
});
app.post("/newone",function(req,res){
    const listName = _.capitalize(req.body.newList);

    const customDoc = {
        name: listName,
        items: []
    };

    User.findById(req.user.id, function(err,user){
        if(err){
            console.log(err);
        }else{
            let present = false;
            user.custom.forEach(function(custom){
                if(custom.name === listName){
                    present = true;
                    res.redirect("/" + listName);
                }
            });
            if(!present){
                user.custom.push(customDoc);
                user.save(function(){
                    res.redirect("/" + listName);
                });
            }
        }
    });
});
app.post("/status",function(req,res){
    const listName = req.body.listName;
    const todoId = req.body.todoId;
    const checkValue = req.body.status;
    if(listName === date.getDate()){
        if(typeof checkValue !== "undefined"){
            User.updateOne({_id: req.user.id, "list._id": todoId}, {$set: {"list.$.status": "inactive"}},function(err,result){
                if(err){
                    console.log(err);
                }else{
                    res.redirect("/");
                }
            });
        }else{
            User.updateOne({_id: req.user.id, "list._id": todoId}, {$set: {"list.$.status": "active"}},function(err,result){
                if(err){
                    console.log(err);
                }else{
                    res.redirect("/");
                }
            });
        }
    }else{
        User.findById(req.user.id, function(err, user){
            if(err){
                console.log(err);
            }else{
                user.custom.forEach(function(custom){
                    if(custom.name === listName){
                        custom.items.forEach(function(item){
                            if(item._id.valueOf() === todoId){
                                if(typeof checkValue !== "undefined"){
                                    item.status = "inactive";
                                }else{
                                    item.status = "active";
                                }
                                user.save(function(){
                                    res.redirect("/" + listName);
                                });
                            }
                        });
                    }
                });
            }
        });
    }
        
});
app.post("/delete-completed",function(req,res){
    const listName = req.body.listName;
    if(listName === date.getDate()){
        User.findByIdAndUpdate(req.user.id,{$pull: {list: {status: "inactive"}}},function(err,user){
            if(err){
                console.log(err);
            }else{
                res.redirect("/");
            }
        });
    }else{
        User.findById(req.user.id, function(err,user){
            if(err){
                console.log(err);
            }else{
                user.custom.forEach(function(custom){
                    if(custom.name === listName){
                        custom.items = custom.items.filter(item => item.status === "active");
                        user.save(function(){
                            res.redirect("/" + listName);
                        });
                    }
                });
            }
        });
    }
});
app.post("/theme",function(req,res){
    theme = req.body.theme;
    const listName = req.body.listName;
    if(theme === "dark"){
        theme = "light";
    }else{
        theme = "dark";
    }
    listName === date.getDate() ? res.redirect("/"): res.redirect("/" + listName);
});



app.listen(process.env.PORT || 3000,function(){
    console.log("Server Started successfully.");
});