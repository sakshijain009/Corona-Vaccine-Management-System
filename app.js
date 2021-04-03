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
  database : "corona"
});


con.connect((err)=>{
	if (err) throw err;
	console.log('connected');
});






/*****************************GET REQUESTS****************************/
app.get("/",(req,res)=>{
	res.render("home",{stat:'none'});
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


/************************POST REQUESTS*******************/
app.post("/patient",(req,res)=>{

  const val = [
    req.body.inputName,
    req.body.inputEmail,
    req.body.inputPIN,
    req.body.inputDOB,
    req.body.contact,
    req.body.optradio
  ]
  
  console.log(val);
  var sql = "INSERT INTO person (p_name,p_email,p_address,p_dob,p_contactno,p_gender) VALUES (?)";   
  con.query(sql, [val],function (err, result) {  
  if (err) throw err;  
  console.log("Number of records inserted: " + result.affectedRows); 
  res.render("home",{stat:'block'}); 
  });  
  
});



/*******************************************************/
app.listen(3000, function() {
  console.log('Running on http://localhost:3000');
});