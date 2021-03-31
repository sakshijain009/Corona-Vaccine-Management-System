const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//MYSQL COONECTION

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: ""
});

//Go to this link only once to create the database
app.get("/createdatabase",(req,res)=>{
	con.connect(function(err) {
	  if (err) throw err;
	  console.log("Connected!");
	  con.query("CREATE DATABASE coronanarona", function (err, result) {
	    if (err) throw err;
	    console.log("Database created");
	  });
	});

});

/*****************************GET REQUESTS****************************/
app.get("/",(req,res)=>{
	res.render("home");
});


app.get("/patient",(req,res)=>{
	res.render("patient");
});

app.get("/Registerhospital",(req,res)=>{
	res.render("Registerhospital");
});

app.get("/Registerinventory",(req,res)=>{
	res.render("Registerinventory");
});

app.get("/hospitaldata",(req,res) =>{
	res.render("hospitaldata");
});

app.get("/hosp_login", (req,res) => {
  res.render('hosp_login');
});

app.get("/inventory_login", (req,res) => {
  res.render('inventory_login');

});






/*******************************************************/
app.listen(3000, function() {
  console.log('Running on http://localhost:3000');
});