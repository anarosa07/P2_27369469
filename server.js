const express = require("express");
const app = express();
const path = require("path");

app.get('/', (request, response)=>{
	response.sendFile(path.join(__dirname + "/index.html")); 
app.listen(process.env.PORT || 5000);
});
