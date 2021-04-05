const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const ejs = require("ejs");
const mysql = require("mysql");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

dotenv.config({path:'./.env'});
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.use(session({secret: "Your secret key"}));






//MYSQL COONECTION-----------------------------------------------------------

var con = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password:process.env.DATABASE_PWD,
  database : process.env.DATABASE
});


con.connect((err)=>{
	if (err) throw err;
	console.log('connected');
});


var pincode;
con.query("SELECT pincode FROM location", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    pincode=result;
    
  });










/*****************************GET REQUESTS****************************/
app.get("/",(req,res)=>{
	res.render("home",{stat:'none'});
});

app.get("/patient",(req,res)=>{
	res.render("patient",{pincodes:pincode});
	
});

app.get("/Registerhospital",(req,res)=>{
	res.render("Registerhospital",{pincodes:pincode,message:'Enter details to Register',color:'success'});
});

app.get("/Registerinventory",(req,res)=>{
	res.render("Registerinventory",{pincodes:pincode});
});

app.get("/hospitaldata",(req,res) =>{
	res.render("hospitaldata");
});

app.get("/hosp_login", (req,res) => {
  res.render('hosp_login',{
    message:''
  });
});

app.get("/hosp_logindata", (req,res) => {
  res.render('hosp_logindata');
});

app.get("/inventory_login", (req,res) => {
  res.render('inventory_login',{stat:'none',hid:''});

});














/************************POST REQUESTS*******************************/
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




// This is hospital signup page post request
app.post("/Registerhospital",(req,res)=>{
  console.log(req.body)


  const name = req.body.inputName;
  const email = req.body.inputEmail;
  const contact = req.body.inputContact;
  const htype = req.body.inputhospitaltype;
  const pwd = req.body.inputPassword;
  const repwd = req.body.reinputPassword;
  const pin = req.body.inputPIN;

  console.log(pin);
  con.query('SELECT h_email from hospital WHERE h_email = ?',[email],async(err,results)=>{
      if (err) {throw err};
      if (results.length>0) {
        return res.render("Registerhospital",{
          pincodes:pincode,
          message:'Please Note That: That email has already been registered! Kindly headover to the login page',
          color:'danger'
        });
      }else if(pwd !== repwd){
        return res.render("Registerhospital",{
          pincodes:pincode,
          message:'Please Note That: Passwords do not match!',
          color:'danger'
        });
      }

      let hashedPassword = await bcrypt.hash(pwd,8);
      console.log(hashedPassword);


      con.query('INSERT INTO hospital SET ?',{h_name: name,h_email: email,h_contactno: contact,h_type: htype,h_address:pin,h_pwd: hashedPassword},function (err, result) {  
      if (err) throw err;  
      console.log("Number of records inserted: " + result.affectedRows); 
      return res.render("Registerhospital",{
          pincodes:pincode,
          message:'Success! Your Hospital has been registered. Please login to continue.',
          color:'success'
        });

      }); 


  });       
  
});



//Hospital login page post request
app.post('/hospital_login',async(req,res)=>{

    try{
      console.log(req.body);
      const email = req.body.hospid;
      const pwd = req.body.hospwd;
      con.query('SELECT * from hospital WHERE h_email = ?',[email],async(err,results)=>{
          console.log(results);
          if (!results || !(await bcrypt.compare(pwd,results[0].h_pwd))) {
            res.status(401).render("hosp_login",{
              message:'Error: Account not found.'
            });
          }else{
            const id = results[0].H_id;

            const token = jwt.sign({id:id},process.env.JWT_SECRET,{
              expiresIn: process.env.JWT_EXPIRES_IN
            });

            console.log("The token is : "+token);

            const cookieOptions = {
              expires: new Date(
                  Date.now() + process.env.JWT_COOKIE_EXPIRES*24*60*60*1000 //Converting to milli second
                ),
              httpOnly:true
            }

            res.cookie('jwt',token,cookieOptions);
            res.status(200).redirect("/");
          }
      });



    }catch(error){
        console.log(error);
    }
});






app.post("/Registerinventory",(req,res)=>{

  const val = [
    inventory(req.body.inputName,req.body.PINinventory),
    req.body.inputName,
    req.body.inputContact,
    req.body.PINinventory
  ]
  
  console.log(val);

  var sql = "INSERT INTO inventory (I_id,I_name,I_contactno,I_address) VALUES (?)";  
  con.query(sql, [val],function (err, result) {  
  if (err) throw err;  
  console.log("Number of records inserted: " + result.affectedRows); 
  res.render('inventory_login',{stat:'block',iid:inventory(req.body.inputName,req.body.PINinventory)});
  });  
  
});





/*******************************************************/
app.listen(3000, function() {
  console.log('Running on http://localhost:3000');
});



function inventory(name,pincode){
  let nam=name;
  let pin=pincode.toString();
  let ren=nam.concat(pin);
  return ren;
}