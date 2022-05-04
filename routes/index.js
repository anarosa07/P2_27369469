var express = require('express');
var router = express.Router();
//llamar el modulo de la base de datos
var sqlite3=require('sqlite3').verbose();
var path = require('path');


//Creacion de la base de datos
const database = path.join(__dirname,"basededatos","base.db"); //LLamando la carpeta y la Base
const db=new sqlite3.Database(database,err=>{
  if(err){
    return console.error(err.message);
  }else{
    console.log('Database Only')
  }
})

const create="CREATE TABLE IF NOT EXISTS Contact(email VARCHAR(15),nombre VARCHAR(10),mensaje TEXT,fecha VARCHAR(10),ip VARCHAR(10));";

db.run(create,err=>{
  if(err){
    return console.error(err.message);
  }else{
    console.log('Table only')
  }
})







//Objeto para interactuar con el HTML
router.get('/',(req, res)=>{
  res.render('index.ejs',{contacts:{}})
});


//Insertar datos 
router.post('/',(req, res)=>{
  const sqb="INSERT INTO Contact(email,nombre,mensaje,fecha,ip) VALUES(?,?,?,?,?);";
  var ip = req.headers["x-forwarded-for"];
  	if (ip){
    	var list = ip.split(",");
    	ip = list[list.length-1];
 	 } else {
	ip = req.connection.remoteAddress;
  	}

    var hoy = new Date();
  	var horas = hoy.getHours();
  	var minutos = hoy.getMinutes();
  	var segundos = hoy.getSeconds()
  	var fecha = hoy.getDate() + '-' + ( hoy.getMonth() + 1 ) + '-' + hoy.getFullYear() + ' / ' + horas + ':' + minutos + ':' + segundos;

  const msg=[req.body.email, req.body.nombre, req.body.mensaje,fecha,ip];
  db.run(sqb,msg,err=>{
    if(err){
      return console.error(err.message);
    }else{
      res.redirect('/');
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
  

module.exports = router;
