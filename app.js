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
  password: "",
  database : "coronanarona"
});


con.connect((err)=>{
	if (err) throw err;
	console.log('connected');
});

/*****************************GET REQUESTS****************************/
app.get("/",(req,res)=>{
	res.render("home");
});

app.get("/patient",(req,res)=>{
	con.query("SELECT pincode FROM location", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.render("patient",{pincodes:result});
  });
	
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