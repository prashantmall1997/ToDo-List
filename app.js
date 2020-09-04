//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: {
    required: true,
    type: String
  }
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your TODO."
});

const item2 = new Item({
  name: "Hit the + button to add new item."
});

const item3 = new Item({
  name: "Press checkbox to delete item."
});

const item4 = new Item({
  name: "Append '/<category name>' to the URL to create a custom ToDo List."
});

const defaultItems = [item1, item2, item3, item4];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  // const day = date.getDate();
  //
  // res.render("list", {
  //   listTitle: day,
  //   newListItems: items
  // });

  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("SUCCESS.");
        }
      });
      res.redirect('/');
    }

    res.render("list", {
      listTitle: "Today",
      newListItems: foundItems
    });
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: req.body.newItem
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});


app.get("/about", function(req, res) {
  res.render("about");
});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  console.log(listName);
  console.log(checkedItemId);

  if (listName === "Today") {
    Item.findByIdAndRemove({
      _id: checkedItemId
    }, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successful deletion");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, (err, foundList) => {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

app.get('/:category', (req, res) => {
  const customListName = req.params.category.toLowerCase();

  List.findOne({
    name: customListName
  }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        //Create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        //Display exsisting list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

app.listen(process.env.PORT, function() {
  console.clear();
  console.log("Server started.");
});
