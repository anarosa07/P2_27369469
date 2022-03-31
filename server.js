const express = require("express");
const app = express();
const path = require("path");

const portNumber = server.address().port;
console.log('Puerto activo')

app.use(express.static(__dirname + "/raiz"));
app.get('/', (req, res)=>{
	res.sendFile(path.join(__dirname + "/index.html")); 
});
app.listen(process.env.PORT || 5000);

