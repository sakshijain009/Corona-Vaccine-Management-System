const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const authController = require('./controllers/auth');

dotenv.config({ path: './.env' });
const con = require('./model/db');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());





// MYSQL CONNECTION-----------------------------------------------------------
/*
var con = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password:process.env.DATABASE_PWD,
  database : process.env.DATABASE
});

*/
con.start.connect((err) => {
  if (err) throw err;
  console.log('connected');
});


var pincode;
con.start.query("SELECT pincode FROM location", function (err, result, fields) {
  if (err) throw err;
  pincode = result;

});

var hospital;
con.start.query("SELECT H_name, H_address FROM hospital", function (err, result, fields) {
  if (err) throw err;
  hospital = result;
});

// var invent;
// con.start.query("SELECT * from inventory", function (err, result) {
//   if (err) throw err;
//   invent = result;
// });

var vaccine;
con.start.query("SELECT V_name from vaccine", function (err, result) {
  if (err) throw err;
  vaccine = result;
});









/*****************************GET REQUESTS****************************/
var counts;
app.get("/", (req, res) => {
  let sql = "select ( select count(*) from vaccinates) as count_vacc, ( select count(*) from hospital) as count_hosp, ( select count(*) from inventory) as count_invent from dual;";
  con.start.query(sql, function (err, result) {
    if (err) throw error;
    counts = result[0];
    res.render("home", { stat: 'none', count: counts });
  })
});

app.get("/patient", (req, res) => {
  res.render("patient", { pincodes: pincode, hospital: hospital });
});

app.get("/choose_hosp", (req, res) => {
  res.render("choose_hosp", { hospital: hospital, pin: pin });
});

app.get("/Registerhospital", (req, res) => {
  res.render("Registerhospital", { pincodes: pincode, message: 'Enter details to Register', color: 'success', vaccines: vaccine });
});

app.get("/Registerinventory", (req, res) => {
  res.render("Registerinventory", { pincodes: pincode });
});

app.get("/inventory_data", authController.isLoggedIn, (req, res) => {

  if (req.user) {

    let sql = "select i.*, s.s_time,s.s_quantity from inventory i join supplies s on s_inventory = i.i_id join hospital h on h.h_id = s.s_hospital where h.h_id = ? order by s.s_time desc;";
    con.start.query(sql, req.user.H_id, function (err, result) {
      if (err) throw err;
      const invent_details = result;
      res.render('inventory_data', { inventory: invent_details });
    });

  } else {
    res.render('hosp_login', {
      message: ''
    });
  }

});

//Login into profile if cookie exists
app.get("/hospitaldata", authController.isLoggedIn, (req, res) => {
  console.log("inside");
  console.log(req.user);
  if (req.user) {

    let sql1 = "select count(*) as count from vaccinates where hosp = ?;";
    con.start.query(sql1, req.user.H_id, function (err, result) {
      if (err) throw err;
      const count = result[0].count;
      let sql = "select i.*, s.s_time,s.s_quantity from inventory i join supplies s on s_inventory = i.i_id join hospital h on h.h_id = s.s_hospital where h.h_id = ? order by s.s_time desc;";
      con.start.query(sql, req.user.H_id, function (err, result) {
        if (err) throw err;
        const invent_details = result[0];
        let sql2 = "select * from inventory;";
        con.start.query(sql2, req.user.H_id, function (err, result) {
          if (err) throw err;
          const inv = result[0].inv;
          res.render("hospitaldata", {
            user: req.user,
            invent_details: invent_details,
            count: count,
            inv: result
          });
        });
      });

    });
  }

  else {
    res.render('hosp_login', {
      message: ''
    });
  }

});


app.get("/logout", authController.logout);

app.get("/hosp_login", (req, res) => {
  res.render('hosp_login', {
    message: ''
  });
});



app.get("/inventory_login", (req, res) => {
  res.render('inventory_login', { stat: 'none', iid: '' });
});


app.get("/hosp_logindata", authController.isLoggedIn, (req, res) => {

  if (req.user) {
    let sql1 = "select * from person p join vaccinates v on v.P = p.p_id join hospital h on v.hosp = h.h_id where h.h_id = ?;";
    con.start.query(sql1, req.user.H_id, function (err, result) {
      if (err) throw err;
      res.render("hosp_logindata", {
        user: req.user,
        patient_details: result
      });
    });
  }
  else {
    res.render('hosp_login', {
      message: ''
    });
  }
});















/************************POST REQUESTS*******************************/
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
  con.start.query(sql, [val], function (err, result) {
    if (err) throw err;
    console.log("Number of records inserted in patient: " + result.affectedRows);
    res.redirect("/choose_hosp");
  });

  var sql1 = "SELECT * from person where P_contactno = (?)";
  con.start.query(sql1, [val[4]], function (err, result, fields) {
    if (err) throw err;
    p_id = result[0].P_id;
  });
});

var hosp_id;
app.post("/choose_hosp", (req, res) => {

  const hosp_name = req.body.inputHOSP;

  var sql2 = "SELECT * from hospital where H_name = (?)";
  con.start.query(sql2, [hosp_name], function (err, result) {
    if (err) throw err;
    hosp_id = result[0].H_id;
    const values = [p_id, hosp_id];
    con.start.query("INSERT INTO vaccinates (P, Hosp) VALUES (?)", [values], function (err, result) {
      if (err) throw err;
      console.log("Number of records inserted in vaccinates: " + result.affectedRows);
    });
  });
  res.render("home", { stat: 'block', count: counts });
});

// This is hospital signup page post request
app.post("/Registerhospital", (req, res) => {
  console.log(req.body)


  const name = req.body.inputName;
  const email = req.body.inputEmail;
  const contact = req.body.inputContact;
  const htype = req.body.inputhospitaltype;
  const pwd = req.body.inputPassword;
  const repwd = req.body.reinputPassword;
  const pin = req.body.inputPIN;
  const vacc = req.body.inputVACC;

  console.log(pin);
  con.start.query('SELECT h_email from hospital WHERE h_email = ?', [email], async (err, results) => {
    if (err) { throw err };
    if (results.length > 0) {
      return res.render("Registerhospital", {
        pincodes: pincode,
        message: 'Please Note That: That email has already been registered! Kindly headover to the login page',
        color: 'danger',
        vaccines: vaccine
      });
    } else if (pwd !== repwd) {
      return res.render("Registerhospital", {
        pincodes: pincode,
        message: 'Please Note That: Passwords do not match!',
        color: 'danger',
        vaccines: vaccine
      });
    }

    let hashedPassword = await bcrypt.hash(pwd, 8);
    console.log(hashedPassword);


    con.start.query('INSERT INTO hospital SET ?', { h_name: name, h_email: email, h_contactno: contact, h_type: htype, h_address: pin, h_pwd: hashedPassword, h_vac: vacc }, function (err, result) {
      if (err) throw err;
      console.log("Number of records inserted in hospital: " + result.affectedRows);
      return res.render("Registerhospital", {
        pincodes: pincode,
        message: 'Success! Your Hospital has been registered. Please login to continue.',
        color: 'success',
        vaccines: vaccine
      });
    });
  });
});



//Hospital login page post request
app.post('/hospital_login', async (req, res) => {

  try {
    console.log(req.body);
    const email = req.body.hospid;
    const pwd = req.body.hospwd;
    con.start.query('SELECT * from hospital WHERE h_email = ?', [email], async (err, results) => {
      console.log('Results :' + results);

      if (results.length === 0) {
        res.status(401).render("hosp_login", {
          message: 'Error: Account not found.'
        });
      } else if (!(await bcrypt.compare(pwd, results[0].H_pwd))) {
        res.status(401).render("hosp_login", {
          message: 'Error: Email or password does not match.'
        });
      } else {
        const id = results[0].H_id;
        console.log("id :" + id);
        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN
        });

        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
          ),
          httpOnly: true
        };
        res.cookie('jwt', token, cookieOptions);
        res.status(200).redirect("/hospitaldata");

      }
    });



  } catch (error) {
    console.log(error);
  }
});

app.post("/Registerinventory", (req, res) => {

  const val = [
    req.body.inputName,
    req.body.inputContact,
    req.body.PINinventory
  ]

  var sql = "INSERT INTO inventory (I_name,I_contactno,I_address) VALUES (?)";
  con.start.query(sql, [val], function (err, result) {
    if (err) throw err;
    console.log("Number of records inserted: " + result.affectedRows);
    res.render('inventory_login', { stat: 'block' });
  });

});

app.post("/inventory_data", authController.isLoggedIn, (req, res) => {
  if (req.user) {
    var today = new Date();
    var ts = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const val = [
      req.user.H_id,
      req.body.id,
      req.body.quantity,
      ts
    ]
    let sql3 = "INSERT INTO supplies (S_hospital,S_inventory,S_quantity,S_time) VALUES (?);";
    con.start.query(sql3, [val], function (err, result) {
      if (err) throw err;
      console.log("Number of records inserted: " + result.affectedRows);
      res.redirect('/inventory_data');
    });
  }
  else {
    res.render('hosp_login', {
      message: ''
    });
  }

});

app.post("/hosp_logindata", authController.isLoggedIn, (req, res) => {
  if (req.user) {
    const val = [[req.body.dose1], [req.body.dose2], [req.user.H_id], [req.body.id]]
    let sql4 = "Update vaccinates SET Date_first= ?, Date_second= ? where Hosp= ? and P=?;";
    con.start.query(sql4, val, function (err, result) {
      if (err) throw err;
      console.log("Number of records updated: " + result.affectedRows);
      res.redirect('/hosp_logindata');
    });
  }
  else {
    res.render('hosp_login', {
      message: ''
    });
  }
});



/*******************************************************/
app.listen(3000, function () {
  console.log('Running on http://localhost:3000');
});
