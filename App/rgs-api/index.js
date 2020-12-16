const express = require('express')
const app = express()
const port = 5000
const fs = require('fs');

var gameDatabase = require('./Catalog_with_index.json')
var collectionData = require('./collections.json')
var userData = require('./users.json')
var requestsData = require('./requests.json');

function createError(status, message) {
	var err = new Error(message);
	err.status = status;
	return err;
}

// Paramaters for when index is called. Gets an array index for the database for the associated game.
app.param('index', function(req, res, next, id){
  // Initialize the index for the game at 0
  let gameIndex = 0;
  let foundFlag = false;
  // Flag for existance check, default to false
  req.exists = false;
  // look for the data for the corresponding index, stopping once found. Increment the index by one for each entry.
  for (let entry of gameDatabase){
    if(entry.INDEX == id){
      // If found, set the fields of the request
      req.gameIndex = gameIndex;
      req.exists = true;
      break;
    }
    gameIndex++;
  }
	next();
})

// Parameters for reqid, requestID is the given request ID. request is the object representation of the given request.
app.param('reqid', function (req, res, next, id) {
  req.requestID = id;
  req.exists = false;
  let index=0;
  // Check if the request exists and set the fields if found.
  for(let entry of requestsData){
    if(req.requestID == entry.ID){
      req.request = entry;
      req.exists = true;
      req.index = 0;
      break;
    }
    index++;
  }
  next();
})
// ************************* START OF PARAMETERS *************************
// Parameters for when userid is called. userID is the users unique ID. collection is an array containing all the
// game IDs in their collection. requests contains all the request objects they are either a lender or a borrower in.
// Collection is an array where each entry is the ID for the owned game.
app.param('userid', function(req, res, next, id){
  req.collection = [];
  req.requests = [];
  req.userID = id;
  // Iterate across the collectionData, when a collection entry is tagged with a user, add the associated ID to an
  // array containing all the gameIDs in their collection.
  for (let entry of collectionData){
    if(entry.USER == id){
      req.collection.push(entry.GAMEINDEX);
    }
  }
  // Iterate across the requestsData, grab all of the requests related to the user and build an array.
  for (let entry of requestsData){
    if(entry.LENDER == id || entry.BORROWER == id)
      req.requests.push(entry);
  }
  next();
})

// Parameters for when gameid is called. gameID is the id of the related game.
app.param('gameid', function (req, res, next, id) {
  req.gameID = id;
  next();
})

// Parameters for when gameid is called. gameID is the id of the related game.
app.param('borrowerid', function (req, res, next, id) {
  req.borrowerid = id;
  next();
})

// Parameters for when gameid is called. gameID is the id of the related game.
app.param('lenderid', function (req, res, next, id) {
  req.lenderid = id;
  req.collection = [];
  // Iterate across the collectionData, when a collection entry is tagged with a user, add the associated ID to an
  // array containing all the gameIDs in their collection.
  for (let entry of collectionData){
    if(entry.USER == id){
      req.collection.push(entry.GAMEINDEX);
    }
  }
  next();
})

// Parameter for statusUpdate. statusUpdate is the new status for the request.
app.param('statusUpdate', function (req, res, next, id) {
  req.newStatus = id;
  next();
})

// ************************* END OF PARAMETERS *************************

// ************************* START OF GETS *************************

// Get all games in database
app.get('/game', (req, res) => {
	res.send(gameDatabase)
})

// Get game by index.
app.get('/game/:index', (req, res, next) => {
  // If it doesn't exist, send an error and return
  if(!req.exists){
    res.send("404:Not found");
    return;
  }
	res.send(gameDatabase[req.gameIndex]);
})

// Get associated user collection.
// Note: the added item is just added to the end of the collections.json rather than in order, so it won't be sorted.
// This shouldn't be a problem however for getting games in collection searches the file for collection items related
// to the userID.
app.get('/user/:userid/collection', (req, res, next)  => {
  // add check if user exists
  res.send(req.collection);
})

app.get('/catalog', (req, res, next) => {
  res.send(collectionData);
})

// Sends the entire collection data basically raw
app.get('/catalog', (req, res, next) => {
  res.send(collectionData);
})

// haven't looked at implementing this yet
app.get('/user', (req, res) => {
	res.send(userData)
})

// Get all the requests associated with a user ID (returns a list of objects)
app.get('/user/:userid/request',(req, res, next) => {
  // TODO: add check if user exists
  res.send(req.requests)
})

// Get an object representation of just the request with the requested ID
app.get('/user/:userid/request/:reqid',(req, res, next) => {
  // if the request doesn't exist, send an error and return.
  if(!req.exists){
    res.send("404:Not found");
    console.log("404:Not found");
    return;
  }
  res.send(req.request);
})

// ************************* END OF GETS *************************

// ************************* START OF PUTS *************************

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
  // Time to check if item is already in the collection
  for(let entry of req.collection){
    if(entry == req.gameID){
      // ask what should be thrown here
      res.send("item already in collection");
      console.log("item already in collection");
      return;
    }
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

// Find out how the status update will be sent. Maybe delete the request upon return or denial?
// possible statuses: pending, approved, returned, denied.
app.put('/user/:userid/request/:reqid/:statusUpdate', (req, res, next) => {
  // If the request doesn't exist, send an error and return.
  if(!req.exists){
    res.send("404:Not found");
    console.log("404:Not found");
    return;
  }
  // Modify the requests STATUS field
  requestsData[req.index].STATUS = req.newStatus;

  // Write to the file.
  fs.writeFile('./requests.json', JSON.stringify(requestsData, null, 2), function writeJSON(err) {
    // Check to see if error was thown
    if (err) return console.log(err);
    console.log("Write Success");
  })
  // Just sent a message for testing purposes
  res.send("Success");
})

// ************************* END OF GETS *************************

// ************************* START OF DELETES *************************

// Delete item from a users collection
// TODO: add check if collection item doesn't exists and error throw
app.delete('/user/:userid/collection/:gameid', (req, res, next) => {
  // Recycled code from my earlier js class implementation modified just a tad.
  let index = 0;
  let foundFlag = false;
  // Simple search for the index of collections where the associated ID and userID is.
  for(let entry of collectionData){
    if((entry.GAMEINDEX == req.gameID) && (entry.USER == req.userID)){
      foundFlag = true;
      break;
    }
    index++;
  }
  // If the entry wasn't found, send an error and return.
  if(!foundFlag){
    res.send("404:Not found");
    console.log("404:Not found");
    return;
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
  res.send("Success");
})

// ************************* END OF DELETES *************************

// ************************* START OF POSTS *************************

// Find out how the request will work. Possibly check if item is in user collection
// Maybe add gameid in the route?
app.post('/user/:borrowerid/request/:lenderid/:gameid', (req, res, next) => {
  let foundFlag = false;
  // Search the lenders collection for the game.
  for (let entry of req.collection){
    if(req.gameid == entry.GAMEINDEX) {
      foundFlag = true;
      break;
    }
  }
  // If the game wasn't found, send an error and return.
  if(!foundFlag){
    res.send("404:Not found");
    console.log("404:Not found");
    return;
  }
  // Super innefficient way of assigning unique IDs to request.
  let newRequestID = 1;
  for (let entry of requestsData){
    if(entry.ID > newRequestID){
      newRequestID = entry.ID;
    }
    // Check if the request for the item already exists while were here
    if(entry.ITEM == req.gameID && entry.LENDER == req.lenderid && entry.BORROWER == req.borrowerid){
      res.send("Error: already have request for that item");
      console.log("Error: already have request for that item");
      return;
    }
  }
  ++newRequestID;
  // Build the new request
  newEntry = {
    "LENDER": req.lenderid,
    "BORROWER": req.borrowerid,
    "ITEM": req.gameID,
    "ID": newRequestID,
    "STATUS": "pending"
  }
  // Add the new request
  requestsData.push(newEntry);
  // Write to the file.
  fs.writeFile('./requests.json', JSON.stringify(requestsData, null, 2), function writeJSON(err) {
    // Check to see if error was thown
    if (err) return console.log(err);
    console.log("Write Success");
  })
  // Just sent a message for testing purposes
  res.send("Success");
})

// ************************* END OF POSTS *************************

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})