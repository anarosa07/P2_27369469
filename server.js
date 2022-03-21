const express = require("express");
const app = express();
const path = require("path");

app.listen(process.env.PORT || 5000);
app.get('/', (request, response)=>{
	response.sendFile(path.join(__dirname + "/index.html")); 
});