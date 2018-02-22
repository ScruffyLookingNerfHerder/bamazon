var dotenv = require("dotenv").config();
var password = process.env.mysql_password;
var cTable = require('console.table');
var inquirer = require('inquirer');
var mysql = require('mysql');
var choice;


var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: password,
  database: 'store_db'
});

connection.connect();

console.log("Welcome Manager!");
prompt();
function prompt(){
  inquirer.prompt([{
    type: "list",
    choices: ["View Products for Sale", new inquirer.Separator(), "View Low Inventory", new inquirer.Separator(), "Add to Inventory", new inquirer.Separator(), "Add New Product", new inquirer.Separator(), "Quit"],
    name: "promptchoice",
    message: "What would you like to do?"
  }]).then(function(answers) {
    choice = answers.promptchoice;
    if (choice === "View Products for Sale"){
      inventory();
    } else if (choice === "View Low Inventory"){
      lowinventory();
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

function lowinventory(){
  connection.query('SELECT * FROM Inventory WHERE Stock < 5', function(error, results, fields){
    console.log("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.table(results);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    prompt();

  })
}
