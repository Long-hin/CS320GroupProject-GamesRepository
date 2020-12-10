const express = require('express')
const app = express()
const port = 5000

var data = require('./Retro_Game_Catalog.json')

function createError(status, message) {
	var err = new Error(message);
	err.status = status;
	return err;
}
/*
# step 1
get /hello/#
# step 2
run param function
# = :index
func(req, res, next, #)
req.index = #
next()
# step 3
func(req, res, next)
res.send(data[req.index])
*/

app.param('index', function(req, res, next, id){
	req.blahble = id;
	next();
})

app.get('/games', (req, res) => {
	res.send(data)
})
app.get('/hello/:index', (req, res, next) => {
	res.send(data[req.blahble])
})

app.listen(port, () => {
	console.log(`App listening on port ${port}`)
})
