//jshint esversion:6 

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); 
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://tajulislam:tajul2114@cluster0todolist.5x0vvmk.mongodb.net/todolistDB"); 

const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
    name: "Welcome to your Daily ToDoList!!!"
});

const item2 = new Item ({
    name: "Write a task & click + to add a task in the list."
});

const item3 = new Item ({
    name: "<-- Hit the checkbox button to delete an item."
});

const defaultItems = [item1, item2, item3]; 

const listSchema = {
    name: {
        type: String,
        required: true
    },
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.set('view engine', 'ejs');

app.get("/", function(req, res){

    Item.find()
    .then(function(foundItems){
        if (foundItems.length === 0){
            Item.insertMany(defaultItems)
                .then(function(){
                    //mongoose.connection.close();

                    console.log("Successfully saved default items in Database!");
                })
                .catch(function(err){
                    console.log(err);
                });
            res.redirect("/");
        }
        else{
            res.render('list', {listTitle: "Today", newListItems: foundItems});
        }
    })
    .catch(function(err){
        console.log(err);
    });
});

app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item ({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName})
        .then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
});

app.post("/delete", function(req, res){
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndDelete(checkedItemID)
        .then(function(){
            console.log("Successfully deleted checked task!");
            res.redirect("/");
    })
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}})
        .then(function(foundList){
            if(foundList){
                res.redirect("/" + listName);
            }
        })
    } 
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName})
    .then(function(foundList){
        if (!foundList){
            //create a new list
            const list = new List ({
                name: customListName,
                items: defaultItems 
            });
            list.save();
            res.redirect("/" + customListName);
        }
        else{
            //show an existing list
            res.render('list', {listTitle: foundList.name, newListItems: foundList.items});
        }
    })
});

app.post("/work", function(){
    const item = req.body.newItem;
    workItems.push(item);
    
})

app.get("/about", function(req, res){
    res.render("about");
});

const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server started on port 3000");
});

