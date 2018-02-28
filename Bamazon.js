var mysql = require('mysql');
var inquirer = require('inquirer');


var connection = mysql.createConnection({
	host: "localhost",
	port: 3306, // PORT Number
	user: "root", // Username
	password: "", // Password
	database: "bamazon_db" // Database Name in mySQL.
});

connection.connect(function(err) {
    if (err) throw err;
  
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
        start(res);
      
    });
  
  });
  
  function start(res){
        console.log("Items For Sale");
        displayItems(res);
        firstPrompt(res);
  }
  
  
  function displayItems(res){
     for(var i = 0; i < res.length; i++){
          console.log("ID: " + res[i].item_id + " Product: " + res[i].product_name + "   Price: " + res[i].price);
      
        }
  }
  
  function firstPrompt(res){
    inquirer.prompt([
        {
          type: "input",
          name: "cartID",
          message: "Please enter ID of item you would like to purchase."
        },
      ]).then(function(user){
          console.log('You have selected: ' + res[user.cartID - 1].product_name);
          var userChoice = res[user.cartID - 1].product_name;
          var userChoice = res[user.cartID - 1];
          secondPrompt(userChoice, res);
      });
  }
  
  function repeatQuestion(res){
    inquirer.prompt([
        {
          type: "confirm",
          name: "repeat",
          message: "Would you like to purchase another item?",
          default: true
        }
      ]).then(function(user){
  
        if(user.repeat){
          console.log('user picked yes');
          firstPrompt(res);
        }
        else{
          console.log('Thanks for shopping with us.');
        }
    });
  }
  
  function secondPrompt(input, res){
    inquirer.prompt([
      {
        type: "input",
        name: "userQuantity",
        message: "How many units of " + input.product_name + " would you like to purchase?"
      }
    ]).then(function(user){
      var userQuantity = user.userQuantity;

      if(userQuantity > input.stock_quantity){
        console.log('We do not have that many in stock');
        secondPrompt(input, res);
      }
  
      else{
        
        var newQuantity = input.stock_quantity - userQuantity;
        var totalPrice = userQuantity * input.price;
        console.log('You have purchased ' + userQuantity + ' ' + input.product_name + ' at a price of $' + totalPrice);
    
         connection.query(
              "UPDATE products SET ? WHERE ?",
              [
                {
                  stock_quantity: newQuantity
                },
                {
                  item_id: input.item_id
                }
              ],
              function(error) {
                if (error) throw error;
              }
            );
         repeatQuestion(res);
         
      }
    });
  }
