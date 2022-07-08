var express = require('express');
var router = express.Router();
//llamar el modulo de la base de datos
var sqlite3=require('sqlite3').verbose();
var path = require('path');
var nodemailer = require("nodemailer");
var fetch = require('node-fetch')
require('dotenv').config()

//Creacion de la base de datos
const database = path.join(__dirname,"basededatos","base.db"); //LLamando la carpeta y la Base
const db=new sqlite3.Database(database,err=>{
  if(err){
    return console.error(err.message);
  }else{
    console.log('Database Only')
  }
})

const create="CREATE TABLE IF NOT EXISTS Contact(email VARCHAR(15),nombre VARCHAR(10),mensaje TEXT,fecha VARCHAR(10),ip VARCHAR(10),pais VARCHAR(15));";

db.run(create,err=>{
  if(err){
    return console.error(err.message);
  }else{
    console.log('Table only')
  }
})



//Insertar datos 
router.post('/',(req, res)=>{
  const sqb="INSERT INTO Contact(email,nombre,mensaje,fecha,ip,pais) VALUES(?,?,?,?,?,?);";
  var ip_client = req.headers["x-forwarded-for"];
  	if (ip_client){
    	var list = ip_client.split(",");
    	ip_client = list[list.length-1];
 	 } else {
	ip_client = req.connection.remoteAddress;
  	}

    var hoy = new Date();
  	var horas = hoy.getHours();
  	var minutos = hoy.getMinutes();
  	var segundos = hoy.getSeconds()
  	var fecha = hoy.getDate() + '-' + ( hoy.getMonth() + 1 ) + '-' + hoy.getFullYear() + ' / ' + horas + ':' + minutos + ':' + segundos;

    const required = req.body['g-recaptcha-response']
    const key = process.env.LLAVEPRIVADA_RECAPTCHA
    const url = 'https://www.google.com/recaptcha/api/siteverify?secret='+ key + '&response=' + required;
    fetch(url, {
    method: 'post',
    })
    .then((response) => response.json())
    .then((google_response) => {
      if (google_response.success == true) {
        let country_ip;
        fetch('http://www.geoplugin.net/json.gp?ip=' + ip_client)
        .then(response => response.json())
        .then(json => {country_ip = json.geoplugin_countryName
        const msg=[req.body.email, req.body.nombre, req.body.mensaje,fecha,ip_client,country_ip];
          db.run(sqb,msg,err=>{
            if(err){
              return console.error(err.message);
            }else{
              res.redirect('/');
              console.log('Captcha verificado')
            }
          })

        var transporter = nodemailer.createTransport({
          host: "smtp-mail.outlook.com",
       secureConnection: false,
       port: 587, 
       tls: {
           ciphers:'SSLv3'
       },
           auth: {
            user: process.env.EMAIL_PRIVATE,
            pass: process.env.PASSWORD_PRIVATE,
            }
          });
      var mailOptions = {
        to: 'programacion2ais@dispostable.com',
        subject: "Programacion II",
        html : `<p>Nombre: ${req.body.nombre}</p>
                <p>Email: ${req.body.email}
                <p>Mensaje: ${req.body.mensaje}
                <p>Fecha/Hora: ${fecha}
                <p>IP: ${ip_client}
                <p>Pais: ${country_ip}`
      };
        transporter.sendMail(mailOptions, function (err, info) {
          if (err) {
            console.log(err);
            console.log('Mensaje no enviado')
          }
          else {
            console.log("Email sent");
            }
        });
	    });

      }else{
        res.redirect('/');
        console.log('Captcha no verificado')
      }
    })
});

//Mostrar datos

router.get('/contactos',(req, res)=>{
  const sqb="SELECT * FROM Contact;";
  db.all(sqb, [],(err, rows)=>{
    if (err){
      return console.error(err.message);
    }else{
    res.render("contactos.ejs",{contacts:rows});
    }
})
});
  
//var express = require('express');
//var router = express.Router();
//const path = require('path');
const {I18n} =require('i18n');
const i18n = new I18n({
    locales: ['es', 'en'],
    directory: path.join(__dirname, '/locales'),
    defaultLocale: 'es',
})

router.get('/', (req, res, next) => {
    i18n.init(req,res);
    const lang = req.acceptsLanguages('es');
    console.log(lang)
    res.render('index',{contacts:{}});
});

router.get('/english', (req,res,next)=>{
  const lang = req.acceptsLanguages('es');
  console.log(lang);
    if(lang){
        i18n.init(req,res);
        res.setLocale('en');
        res.render('index',{contacts:{}});
    }
  
    
})

router.get('/login',(req,res)=>{
  res.render('login')
})

router.post('/login',(req,res)=>{
  let client = 'admin';
  let pw = '1234'
  let user = req.body.username;
  let pass = req.body.password;
  if(user==client && pass==pw){
    res.redirect('/contactos')
  }else{
    res.redirect('/login')
  }
})

module.exports = router;
