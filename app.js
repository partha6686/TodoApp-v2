const express = require("express");
const https = require("https");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const atlas = require(__dirname + "/atlas.js");


const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine','ejs');



mongoose.connect("mongodb+srv://admin-partha:"+ atlas.password +"@cluster0.gn61a.mongodb.net/todoDB");

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

const TodoList = mongoose.model("todo",todoSchema);

const todoDoc = [
    {
        name: "Welcome to your to-do list"
    },
    {
        name: "Hit + button to add new"
    },
    {
        name: "Hit x button to delete"
    }
];


const customTodoSchema = new mongoose.Schema ({
    name: String,
    items: [todoSchema]
});

const CustomList = mongoose.model("customList",customTodoSchema);

let theme = "dark";

app.get("/",function(req,res){ 
    const day = date.getDate(); 
    TodoList.find(function(err,todos){
        if(err){
            console.log(err);
        } else{
            if(todos.length === 0){
                TodoList.insertMany(todoDoc, function(err){
                    if(err){
                        console.log(err);
                    }
                });
                res.redirect("/");
            }
            else{
                res.render('todo',{
                    listTitle: day,
                    todos: todos,
                    theme: theme
                });
            }
        }
    });
});

app.get("/:todoName",function(req,res){
    const customTodoName = _.capitalize(req.params.todoName);

    CustomList.findOne({name: customTodoName},function(err,results){
        if(err){
            console.log(err);
        } else {
            if(!results){
                const custom = new CustomList ({
                    name: customTodoName,
                    items: todoDoc
                });
                custom.save();
                res.redirect("/" + customTodoName);
            } else {
                res.render('todo',{
                    listTitle: results.name,
                    todos: results.items,
                    theme: theme
                });
            }
        }
    });
});

app.post("/",function(req,res){
    const newTodo = req.body.newTodo;
    const listName = req.body.submit;
    
    const newTodoDoc = new TodoList({
        name: newTodo
    });

    if(listName === date.getDate()) {
        newTodoDoc.save();
        res.redirect("/");
    } else {
        CustomList.findOne({name: listName},function(err,results){
            if(err){
                console.log(err);
            }else{
                results.items.push(newTodoDoc);
                results.save();
                res.redirect("/" + listName);
            }     
        });
    }  
});

app.post("/delete",function(req,res){
    const listName = req.body.listName;
    const todoId = req.body.todoId;

    if(listName === date.getDate()){
        TodoList.deleteOne({_id: todoId},function(err){
            if(err){
                console.log(err);
            }
        });
        res.redirect("/");
    } else {
        // CustomList.findOne({name: listName},function(err,results){
        //     if(err){
        //         console.log(err);
        //     } else {
        //         results.items = results.items.filter(item => item._id.valueOf() !== todoId);
        //         results.save();
        //         res.redirect("/" + listName);
        //     }
        // });
        CustomList.findOneAndUpdate({name: listName}, {$pull: {items: {_id: todoId}}}, function(err,result){
            if(err){
                console.log(err);
            } else {
                res.redirect("/" + listName);
            }
        });
    } 
});
app.post("/newone",function(req,res){
    const listName = req.body.newList;
    res.redirect("/" + listName);
});
app.post("/status",function(req,res){
    const listName = req.body.listName;
    const todoId = req.body.todoId;
    const checkValue = req.body.status;
    if(listName === date.getDate()){
        if(typeof checkValue !== "undefined"){
            TodoList.findOneAndUpdate({_id: todoId},{status: "inactive"},function(err, result){
                if(err){
                    console.log(err);
                }
            });
        }else{
            TodoList.findOneAndUpdate({_id: todoId},{status: "active"},function(err, result){
                if(err){
                    console.log(err);
                }
            });
        }
        res.redirect("/");
    }else{
        if(typeof checkValue !== "undefined"){
            CustomList.updateOne({
                name: listName,
                "items._id": todoId
            },{
                $set: {"items.$.status": "inactive"}
            },function(err,result){
                if(err){
                    console.log(err);
                }
            });
        }else{
            CustomList.updateOne({
                name: listName,
                "items._id": todoId
            },{
                $set: {"items.$.status": "active"}
            },function(err,result){
                if(err){
                    console.log(err);
                }
            });
        }
        res.redirect("/" + listName);
    }
});
app.post("/delete-completed",function(req,res){
    const listName = req.body.listName;
    if(listName === date.getDate()){
        TodoList.deleteMany({status: "inactive"},function(err){
            if(err){
                console.log(err);
            }else{
                res.redirect("/");
            }
        });
    }else{
        CustomList.updateMany({name: listName}, {$pull: {items: {status: "inactive"}}}, function(err,result){
            if(err){
                console.log(err);
            } else {
                res.redirect("/" + listName);
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