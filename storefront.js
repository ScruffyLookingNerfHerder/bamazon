var dotenv = require("dotenv").config();
var password = process.env.mysql_password;
var cTable = require('console.table');
var inquirer = require('inquirer');
var answer;
var storefront;
var remaininginventory;
var item;
var howmuch;
var itemid;
var subtracted;
var cost;



var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: password,
  database: 'store_db'
});

connection.connect();


function store() {
  connection.query('SELECT * FROM Inventory', function(error, results, fields) {
    if (error) throw error;
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
    console.table(results);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
    storefront = results;
    promptforchoice();

  });

};

store();



function promptforchoice() {
  remaininginventory = 0;
  inquirer.prompt([{
      name: "pleasechoose",
      type: "input",
      message: "Please enter the item number (number to the left hand side) of the item you would like to purchase \n If you would like to leave, please enter 'leave'",
      validate: function(input) {
        var done = this.async();
        if (input === 'leave'){
          done(null, true);

        }
        input = parseInt(input);
        if (isNaN(input) || input === "" || input == 0 || input > storefront.length) {
          done('That is an invalid choice. Please choose an item or leave');
          return false;
        } else {
          done(null, true);
        }

      }
    }])
    .then(function(answers) {
      answer = answers.pleasechoose;
      if (answer == 'leave') {
        console.log("Thank you, please come again!");
        connection.end();
      } else {
        determinechoice();
      }
    });

}

function determinechoice() {
  for (var i = 0; i < storefront.length; i++) {
    if (answer == storefront[i].id) {
      remaininginventory = storefront[i].Stock;
      item = storefront[i].Item;
      price = storefront[i].Price;
      itemid = storefront[i].id;
    }
  }
  promptforpurchase();
}

function promptforpurchase() {

  if (remaininginventory > 1) {
    inquirer.prompt([{
      type: "list",
      choices: ["Yes", new inquirer.Separator(), "No"],
      name: "purchasechoiceone",
      message: "We have " + remaininginventory + " " + item + "'s left. Would you like to purchase?"
    }]).then(function(answers) {
      if (answers.purchasechoiceone == "Yes") {

        howmany();
      } else {
        console.log("Way to not support small businesses. Keep browsing and maybe think about someone other than yourself");
        store();
      }
    });
  } else if (remaininginventory === 1) {
    inquirer.prompt([{
      type: "list",
      choices: ["Yes", new inquirer.Separator(), "No"],
      name: "purchasechoiceone",
      message: "We only have one " + item + " left. Would you like to purchase it?"
    }]).then(function(answers) {
      if (answers.purchasechoiceone == "Yes") {
        howmuch = 1;
        determinecost();

      } else {
        console.log("Way to not support small businesses. Keep browsing and maybe think about someone other than yourself");
        store();
      }
    });
  } else {
    console.log("We are sorry, we have no more " + item + "'s available. Please choose something else");
    store();
  }
};

function howmany (){
  inquirer.prompt([
    {
      name: "quantity",
      type: "input",
      message: "How many would you like to purchase?",
      validate: function(input) {
        var done = this.async();
        input = parseInt(input);
        if (isNaN(input) || input === "" || input === 0) {
          done('That is an invalid choice. Please enter a quantity');
          return false;
        } else if (input > remaininginventory) {
          done('We are sorry, we do not currently have that many in stock. Please limit your choice to ' + remaininginventory + ' or less');
          return false;
        } else {
          done(null,true);
        }

      }
    }])
    .then(function(answers) {
      howmuch = answers.quantity;
      determinecost();
      
    });
}

function updatestore(){
  remaininginventory = parseInt(remaininginventory);
  subtracted = remaininginventory - howmuch;
  console.log("\nYou have purchased " + howmuch + " " + item + "'s today!");
  var query = connection.query(
    "UPDATE Inventory SET ? WHERE ?",
    [
      {
        stock: subtracted
      },
      {
        Item: item
      }
    ]
  );
  console.log("Please feel free to keep browsing!");
}

function determinecost(){
  cost = howmuch * price;
  console.log("Your total is $" + cost);
  inquirer.prompt([{
    type: "list",
    choices: ["Yes", new inquirer.Separator(), "No"],
    name: "confirm",
    message: "Are you sure you want to purchase " + howmuch + " " + item + "'s for $" + cost,
  }]).then(function(answers) {
    if (answers.confirm == "Yes") {
      updatestore();
      store();
    } else {
      console.log("Way to tease us then leave us. Keep browsing and think about what you just did.");
      store();
    }
  });
}
