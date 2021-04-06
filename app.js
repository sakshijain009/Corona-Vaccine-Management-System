const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config({ path: './.env' });
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.json());








//MYSQL COONECTION-----------------------------------------------------------

var con = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PWD,
  database: process.env.DATABASE
});


con.connect((err) => {
  if (err) throw err;
  console.log('connected');
});


var pincode;
con.query("SELECT pincode FROM location", function (err, result, fields) {
  if (err) throw err;
  console.log(result);
  pincode = result;

});

var hospital;
con.query("SELECT H_name, H_address FROM hospital", function (err, result, fields) {
  if (err) throw err;
  console.log(result);
  hospital = result;
});









/*****************************GET REQUESTS****************************/
app.get("/", (req, res) => {
  res.render("home", { stat: "none" });
});

app.get("/patient", (req, res) => {
  res.render("patient", { pincodes: pincode, hospital: hospital });

});

app.get("/Registerhospital", (req, res) => {
  res.render("Registerhospital", { pincodes: pincode, message: 'Enter details to Register', color: 'success' });
});

app.get("/Registerinventory", (req, res) => {
  res.render("Registerinventory", { pincodes: pincode });
});

app.get("/hospitaldata", (req, res) => {
  res.render("hospitaldata");
});

app.get("/hosp_login", (req, res) => {
  res.render('hosp_login', { stat: 'none', hid: '' });
});

app.get("/inventory_login", (req, res) => {
  res.render('inventory_login', { stat: 'none', iid: '' });
});

app.get("/choose_hosp", (req, res) => {
  res.render("choose_hosp", { hospital: hospital, pin: pin });
});





/************************POST REQUESTS*******************/

var p_id;
app.post("/patient", (req, res) => {

  const val = [
    req.body.inputName,
    req.body.inputEmail,
    req.body.inputPIN,
    req.body.inputDOB,
    req.body.contact,
    req.body.optradio
  ]

  pin = req.body.inputPIN;

  var sql = "INSERT INTO person (p_name,p_email,p_address,p_dob,p_contactno,p_gender) VALUES (?)";
  con.query(sql, [val], function (err, result) {
    if (err) throw err;
    console.log("Number of records inserted in patient: " + result.affectedRows);
    res.redirect("/choose_hosp");
  });

  var sql1 = "SELECT * from person where P_contactno = (?)";
  con.query(sql1, [val[4]], function (err, result, fields) {
    if (err) throw err;
    p_id = result[0].P_id;
  });
});

var hosp_id;
app.post("/choose_hosp", (req, res) => {

  const hosp_name = req.body.inputHOSP;

  var sql2 = "SELECT * from hospital where H_name = (?)";
  con.query(sql2, [hosp_name], function (err, result) {
    if (err) throw err;
    hosp_id = result[0].H_id;
    const values = [p_id, hosp_id];
    con.query("INSERT INTO vaccinates (P, Hosp) VALUES (?)", [values], function (err, result) {
      if (err) throw err;
      console.log("Number of records inserted in vaccinates: " + result.affectedRows);
    });
  });
  return res.redirect("/");
});


app.post("/Registerhospital", (req, res) => {
  console.log(req.body)


  const name = req.body.inputName;
  const email = req.body.inputEmail;
  const contact = req.body.inputContact;
  const htype = req.body.inputhospitaltype;
  const pwd = req.body.inputPassword;
  const repwd = req.body.reinputPassword;
  const pin = req.body.inputPin;

  console.log(email);
  con.query('SELECT h_email from hospital WHERE h_email = ?', [email], (err, results) => {
    if (err) { throw err };
    if (results.length > 0) {
      return res.render("Registerhospital", {
        pincodes: pincode,
        message: 'Please Note That: That email has already been registered! Kindly headover to the login page',
        color: 'danger'
      });
    } else if (pwd !== repwd) {
      return res.render("Registerhospital", {
        pincodes: pincode,
        message: 'Please Note That: Passwords do not match!',
        color: 'danger'
      });
    }
  });

  /*var sql = "INSERT INTO hospital (h_id,h_name,h_email,h_contactno,h_type,h_address) VALUES (?)";  
  con.query(sql, [val],function (err, result) {  
  if (err) throw err;  
  console.log("Number of records inserted: " + result.affectedRows); 
  res.render('hosp_login');

  });  */

});


app.post("/Registerinventory", (req, res) => {

  const val = [
    inventory(req.body.inputName, req.body.PINinventory),
    req.body.inputName,
    req.body.inputContact,
    req.body.PINinventory
  ]

  console.log(val);

  var sql = "INSERT INTO inventory (I_id,I_name,I_contactno,I_address) VALUES (?)";
  con.query(sql, [val], function (err, result) {
    if (err) throw err;
    console.log("Number of records inserted: " + result.affectedRows);
    res.render('inventory_login', { stat: 'block', iid: inventory(req.body.inputName, req.body.PINinventory) });
  });

});





/*******************************************************/
app.listen(3000, function () {
  console.log('Running on http://localhost:3000');
});



function inventory(name, pincode) {
  let nam = name;
  let pin = pincode.toString();
  let ren = nam.concat(pin);
  return ren;
}