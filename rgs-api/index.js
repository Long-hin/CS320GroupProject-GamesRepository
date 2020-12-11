const express = require('express')
const app = express()
const port = 5000
const fs = require('fs');

var gameDatabase = require('./Catalog_with_index.json')
var collectionData = require('./collections.json')
var userData = require('./users.json')

function createError(status, message) {
	var err = new Error(message);
	err.status = status;
	return err;
}

// Paramaters for when index is called. Gets an array index for the database for the associated game.
app.param('index', function(req, res, next, id){
  // Initialize the index for the game at 0
  let gameIndex = 0;
  // look for the data for the corresponding index, stopping once found. Increment the index by one for each entry.
  for (let entry of gameDatabase){
    if(entry.INDEX == id){
      // If found, set the field of the request
      req.gameIndex = gameIndex;
      break;
    }
    gameIndex++;
  }
  // TODO: Figure out how to throw a 404 later if not found.
	next();
})

// Get all games in database
app.get('/game', (req, res) => {
	res.send(gameDatabase)
})

// Get game by index.
app.get('/game/:index', (req, res, next) => {
	res.send(gameDatabase[req.gameIndex]);
})

// Parameters for when userid is called. All for now is the collection.
// Collection is an array where each entry is the ID for the owned game.
app.param('userid', function(req, res, next, id){
  req.collection = [];
  req.userID = id;
  // Iterate across the collectionData, when a collection entry is tagged with a user, add the associated ID to an
  // array containing all the gameIDs in their collection.
  for (let entry of collectionData){
    if(entry.USER == id){
      req.collection.push(entry.GAMEINDEX);
    }
  }
  next();
})

// Get associated user collection.
// Note: the added item is just added to the end of the collections.json rather than in order, so it won't be sorted.
// This shouldn't be a problem however for getting games in collection searches the file for collection items related
// to the userID.
app.get('/user/:userid/collection', (req, res, next)  => {
  res.send(req.collection);
})

// Sends the entire collection data basically raw
app.get('/catalog', (req, res, next) => {
  res.send(collectionData);
})

// haven't looked at implementing this yet
app.get('/user', (req, res) => {
	res.send(userData)
})

// Parameters for when gameid is called. gameID is the id of the related game.
app.param('gameid', function (req, res, next, id) {
  req.gameID = id;
  next();
})

// Put new item in the collection.
// TODO: add check if item is already in collection, add error throw if gameID isn't in the index.
app.put('/user/:userid/collection/:gameid', (req, res, next) => {
  // Construct the new entry from the given fields, defaulting borrow and status to true.
  newEntry = {
    "USER":req.userID,
    "GAMEINDEX":req.gameID,
    "ALLOWBORROW":"true",
    "STATUS":"available"
  }
  // Add the new entry to the end of the collectionData array opened earlier from the json file.
  collectionData.push(newEntry)
  // Rewrite collections.json
  fs.writeFile('./collections.json', JSON.stringify(collectionData, null, 2), function writeJSON(err) {
    // Check to see if error was thown
    if (err) return console.log(err);
    console.log("Write Success");
  })
  // Just sent a message for testing purposes
  res.send("Success");
})

// Delete item from a users collection
// TODO: add check if collection item doesn't exists and error throw
app.delete('/user/:userid/collection/:gameid', (req, res, next) => {
  // Recycled code from my earlier js class implementation modified just a tad.
  let index = 0;
  // Simple search for the index of collections where the associated ID and userID is.
  for(let entry of collectionData){
    if((entry.GAMEINDEX == req.gameID) && (entry.USER == req.userID)){
      break;
    }
    index++;
  }
  // if index is the size of the collectionData array, it should mean not found. Add error throw later for that.
  // Now remove the item from the array.
  collectionData.splice(index,1);
  // Rewrite collections.json
  fs.writeFile('./collections.json', JSON.stringify(collectionData, null, 2), function writeJSON(err) {
    // Check to see if error was thown
    if (err) return console.log(err);
    console.log("Write Success");
  })
  // Send a quick message for testing purposes
  res.send("Success");
})

app.listen(port, () => {
	console.log(`App listening on port ${port}`)
})
