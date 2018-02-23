var dotenv = require("dotenv").config();
var password = process.env.mysql_password;
var cTable = require('console.table');
var inquirer = require('inquirer');
var mysql = require('mysql');
var choice;
var store;
items = [];
var remainingstock;
var newtotalinventory;
departments = [];
var deptchosen;
var newproductname;
var newproductprice;
var newproductinventory;


var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: password,
  database: 'store_db'
});

connection.connect();

console.log("Welcome Manager!");
prompt();

function prompt() {
  inquirer.prompt([{
    type: "list",
    choices: ["View Products for Sale", new inquirer.Separator(), "View Low Inventory", new inquirer.Separator(), "Add to Inventory", new inquirer.Separator(), "Add New Product", new inquirer.Separator(), "Quit"],
    name: "promptchoice",
    message: "What would you like to do?"
  }]).then(function(answers) {
    choice = answers.promptchoice;
    if (choice === "View Products for Sale") {
      inventory();
    } else if (choice === "View Low Inventory") {
      lowinventory();
    } else if (choice === "Add to Inventory") {
      addtoinventory();
    } else if (choice === "Add New Product") {
      addproduct();
    } else if (choice === "Quit") {
      console.log("Thanks for visiting! We're totally going back to work now...");
      connection.end();
    }
  });
}

function inventory() {
  connection.query('SELECT * FROM Inventory', function(error, results, fields) {
    if (error) throw error;
    console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.table(results);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log("");
    prompt();
  });

};

function lowinventory() {
  connection.query('SELECT * FROM Inventory WHERE Stock < 5', function(error, results, fields) {
    console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.table(results);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    prompt();

  })
}

function addtoinventory() {
  connection.query('SELECT * FROM Inventory', function(error, results, fields) {
    if (error) throw error;

    store = results;
    for (var i = 0; i < store.length; i++) {
      items.push(store[i].Item);
    }
    inquirer.prompt([{
      type: "list",
      choices: items,
      name: "pickitem",
      message: "Which item have you recieved more inventory for?"
    }]).then(function(answers) {
      itemchosen = answers.pickitem;
      inquirer.prompt([{
        type: "input",
        name: "amount",
        message: "How much new inventory have you recieved?",
        validate: function(input) {
          var done = this.async();

          if (input == "I am an idiot") {
            done(null, true);

          }
          if (isNaN(input)) {
            done('That is not a number. Please try again');
            return false;

          } else if (input === "0") {
            done('You have entered 0. There is nothing to update. Please try again. If you have mistakenly opened this menu and have no new inventory, please type I am an idiot');
            return false;
          } else {
            done(null, true);
          }
        }
      }]).then(function(answers) {
        amountadded = answers.amount;
        if (amountadded == "I am an idiot") {
          console.log("Yes, yes you are. Operation aborted.");
          prompt();
        } else {
          amountadded = parseInt(amountadded);
          inquirer.prompt([{
            type: "list",
            name: "confirmation",
            choices: ["Yes", new inquirer.Separator(), "No"],
            message: "Please confirm you are adding " + amountadded + " " + itemchosen + " to inventory"
          }]).then(function(answers) {
            var confirm = answers.confirmation;
            if (confirm == "No") {
              console.log("Operation Aborted");
              prompt();
            } else {
              console.log("adding");
              var query = "UPDATE Inventory SET Stock = Stock + ? WHERE Item = ?";

              connection.query(query, [amountadded, itemchosen], function(err, res) {
                if (err) throw err;
                console.log("Inventory added!");
                prompt();
              });
            };
          });
        }
      });

    });
  })
}

function addproduct(){
    var query = "SELECT Department FROM Inventory GROUP BY Department";
    connection.query(query, function(err, res) {
      for (var i = 0; i < res.length; i++) {
        departments.push(res[i].Department);
      }

      inquirer.prompt([{
        type: "list",
        choices: departments,
        name: "pickdept",
        message: "Which department is your new product in?"
      }]).then(function(answers) {
        deptchosen = answers.pickdept;
        inquirer.prompt([{
          type: "input",
          name: "amount",
          message: "How much new inventory have you recieved?",
          validate: function(input) {
            var done = this.async();

            if (input == "I am an idiot") {
              done(null, true);

            }
            if (isNaN(input)) {
              done('That is not a number. Please try again');
              return false;

            } else if (input === "0") {
              done('You have entered 0. There is nothing to update. Please try again. If you have mistakenly opened this menu and have no new inventory, please type I am an idiot');
              return false;
            } else {
              done(null, true);
            }
          }
        },{
          type: "input",
          name: "newprice",
          message: "What is the price?",
          validate: function(input) {
            var done = this.async();

            if (input == "I am an idiot") {
              done(null, true);

            }
            if (isNaN(input)) {
              done('That is not a number. Please try again');
              return false;

            } else if (input === "0") {
              done('You have entered 0. There is nothing to update. Please try again. If you have mistakenly opened this menu and have no new inventory, please type I am an idiot');
              return false;
            } else {
              done(null, true);
            }
          }
      }]).then(function(answers) {
          if (answers.amount === "I am an idiot"){
            console.log("Yup, you are.");
            prompt();
          }
          newproductinventory = answers.amount;
          newproductprice = answers.newprice;
          inquirer.prompt([{
            type: "input",
            name: "productnew",
            message: "What new product are you adding?"
          }]).then(function(answers){
            newproductname = answers.productnew;

            inquirer.prompt([{
              type: "list",
              choices: ["Yes", new inquirer.Separator(), "No"],
              name: "confirm",
              message: "Please confirm you are adding " + newproductname + " to " + deptchosen + " with an inventory of " + newproductinventory
            }]).then(function(answers){
              if (answers.confirm === "Yes"){
                //query stuff
                //add price question
                newproductinventory = parseInt(newproductinventory);
                newproductprice = parseInt(newproductprice);
                var query = "INSERT INTO Inventory (Item, Department, Price, Stock) VALUES (?,?,?,?)";
                connection.query(query, [newproductname, deptchosen, newproductprice, newproductinventory], function(err, res) {
                  if(err) {
                    throw err;
                  } else{
                    console.log("added!");
                    prompt();
                  }

              })

              } else {
                console.log("Operation Aborted");
                prompt();
              }
            })
          })
        })
      })
    })
  }
