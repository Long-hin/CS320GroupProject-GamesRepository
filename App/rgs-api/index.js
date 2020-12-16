const express = require('express')
const appl = express()
const port = 5000
const fs = require('fs');
const app = express.Router()

var bodyParser = require('body-parser');
var gameDatabase = require('./Catalog_with_index.json')
var collectionData = require('./collections.json')
var userData = require('./users.json')
var requestsData = require('./requests.json');

function createError(status, message) {
	var err = new Error(message);
	err.status = status;
	return err;
}

app.use(bodyParser.json());

// ************************* START OF PARAMETERS *************************

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
      req.index = index;
      break;
    }
    index++;
  }
  next();
})

// Parameters for when userid is called. userID is the users unique ID. collection is an array containing all the
// game IDs in their collection. requests contains all the request objects they are either a lender or a borrower in.
// Collection is an array where each entry is the ID for the owned game.
app.param('userid', function(req, res, next, id){
  // This one is all the info
  req.userCollection = [];
  // This one is just ID for existance checks
  req.collection = [];
  req.requests = [];
  req.userID = id;
  req.userExists = false;
  userIndex = 0;
  for(let entry of userData){
    if(entry.userID == id){
      req.userInfo = {
        "userID":entry.userID,
        "email":entry.email,
        "firstName":entry.firstName,
        "lastName":entry.lastName,
        "address":entry.address,
        "city":entry.city,
        "state":entry.state,
        "zipcode":entry.zipcode,
        "contry":entry.country
      }
      req.userExists = true;
      req.userIndex = userIndex;
      break;
    }
    userIndex++;
  }
  // Iterate across the collectionData, when a collection entry is tagged with a user, add the associated ID to an
  // array containing all the gameIDs in their collection.
  for (let entry of collectionData){
    if(entry.USER == id){
      // Get information about the game from the gameDatabase by ID
      for(let game of gameDatabase){
        if(game.INDEX == entry.GAMEINDEX){
          name = game.TITLE;
          platform = game.CONSOLE;
          break;
        }
      }
      // Get information about the user from the userData by ID
      for(let user of userData){
        if(user.userID == entry.USER){
          owner = user.firstName.concat(" ");
          owner = owner.concat(user.lastName);
        }
      }
      // Construct the new entry
      let newEntry = {
        "id":entry.GAMEINDEX,
        "name":name,
        "platform":platform,
        "owner":owner,
        "userID":entry.USER,
        "allowBorrow":entry.ALLOWBORROW
      }
      // add the entry to the collection.
      req.collection.push(entry.GAMEINDEX);
      req.userCollection.push(newEntry);
    }
  }
  // Iterate across the requestsData, grab all of the requests related to the user and build an array.
  for (let entry of requestsData){
    if(entry.LENDER == id || entry.BORROWER == id)
      req.requests.push(entry);
  }
  // Now add a field in the requests array for the game name.
  for (let request of req.requests){
    for (let game of gameDatabase){
      if(game.INDEX == request.ITEM){
        request.GAME_NAME = game.TITLE;
        break;
      }
    }
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
	res.status(200).json(gameDatabase)
})

// Get game by index.
app.get('/game/:index', (req, res, next) => {
  // If it doesn't exist, send an error and return
  if(!req.exists){
    res.status(404).send("Not found");
    return;
  }
	game = gameDatabase[req.gameIndex]
	res.status(200).json({
		name: game.TITLE,
		platform: game.CONSOLE,
		developer: game.DEVELOPER,
		genre: game.GENRE,
		url: game.URL,
		release: game.RELEASE_DATE
	});
})

// Get associated user collection.
// Note: the added item is just added to the end of the collections.json rather than in order, so it won't be sorted.
// This shouldn't be a problem however for getting games in collection searches the file for collection items related
// to the userID.
app.get('/user/:userid/collection', (req, res, next)  => {
  // check if user exists
  if(!req.userExists){
    res.status(404).send("404:User not found");
    return;
  }
  // send the formatted object.
  res.status(200).json(req.userCollection);
})

// Sends the entire collection data in the format specified below
app.get('/catalog', (req, res, next) => {
  // Transform the data before sending to the following json format:
  /*
  "id": ,
  "name": ,
  "platform": ,
  "owner": ,
  "userID": ,
 */
  let collections = [];
  // Iterate across the collections database
  for(let entry of collectionData){
    // For each entry, find the game in the game database and fetch some information
    for(let game of gameDatabase){
      if(game.INDEX == entry.GAMEINDEX){
        name = game.TITLE;
        platform = game.CONSOLE;
        break;
      }
    }
    // For each entry, find the user in the user database and fetch some information
    for(let user of userData){
      if(user.userID == entry.USER){
        owner = user.firstName.concat(" ");
        owner = owner.concat(user.lastName);
      }
    }
    // Construct the new entry
    let newEntry = {
      "id":entry.GAMEINDEX,
      "name":name,
      "platform":platform,
      "owner":owner,
      "userID":entry.USER
    }
    // Push it onto the data being sent
    collections.push(newEntry);
  }
  // Send the constructed collection
  res.status(200).json(collections);
})

// Sends a users information from the database.
app.get('/user/:userid', (req, res, next) => {
  if(!req.userExists){
    res.status(404).send("404:User not found");
    return;
  }
  res.status(200).json(req.userInfo);
})

// Get all the requests associated with a user ID (returns a list of objects)
app.get('/user/:userid/request',(req, res, next) => {
  // TODO: add check if user exists
  res.status(200).json(req.requests)
})

/* Old Unused route
// Get an object representation of just the request with the requested ID
app.get('/user/:userid/request/:reqid',(req, res, next) => {
  // if the request doesn't exist, send an error and return.
  if(!req.exists){
    res.status(404).send("404:Not found");
    console.log("404:Not found");
    return;
  }
  res.status(200).json(req.request);
})
*/
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
      res.status(409).send("409:Item already in collection");
      console.log("409:Item already in collection");
      return;
    }
  }
  // Add the new entry to the end of the collectionData array opened earlier from the json file.
  collectionData.push(newEntry)
  // Rewrite collections.json
  fs.writeFile('./collections.json', JSON.stringify(collectionData, null, 2), function writeJSON(err) {
    // Check to see if error was thown
    if (err) return console.log(err);
    console.log("success");
  })
  // Just sent a message for testing purposes
  res.status(201).send("success");
})

// Find out how the status update will be sent.
// possible statuses: pending, approved, returned, denied.
app.put('/user/:userid/request/:reqid/:statusUpdate', (req, res, next) => {
  // If the request doesn't exist, send an error and return.
  if (!req.exists){
    res.status(404).send("404:Not found");
    console.log("404:Not found");
    return;
  }

  // Delete the request if the STATUS is now denied.
  if (req.newStatus == "denied"){
    requestsData.splice(req.index,1);
  }
  else if (req.newStatus == "approved"){
    // Flip the flag in the collections
    let gameID = requestsData[req.index].ITEM;
    let lender = requestsData[req.index].LENDER;
    for (let entry of collectionData){
      if(entry.USER == lender && entry.GAMEINDEX == gameID){
        entry.ALLOWBORROW = !entry.ALLOWBORROW;
        break;
      }
    }
    // Remove Other requests for the same item from the same user
    let index = 0;
    for(let entry of requestsData){
      if (index == req.index){
        // Don't delete that dummy
        console.log("");
      }
      else if(entry.LENDER == lender && entry.ITEM == gameID){
        requestsData.splice(index,1);
        index--;
      }
    }
    requestsData[req.index].STATUS = req.newStatus;
  }
  else if (req.newStatus == "returned"){
    // Flip the flag in the collections
      let gameID = requestsData[req.index].ITEM;
      let lender = requestsData[req.index].LENDER;
      for (let entry of collectionData){
        if(entry.USER == lender && entry.GAMEINDEX == gameID){
          entry.ALLOWBORROW = !entry.ALLOWBORROW;
          break;
        }
      }
    // Delete the request
    requestsData.splice(req.index,1);
    }
  else {
    // Modify the requests STATUS field
    requestsData[req.index].STATUS = req.newStatus;
  }

  // Write to the requests.
  fs.writeFile('./requests.json', JSON.stringify(requestsData, null, 2), function writeJSON(err) {
    // Check to see if error was thown
    if (err) return console.log(err);
    console.log("success");
  })
  // Write to the collections file
  fs.writeFile('./collections.json', JSON.stringify(collectionData, null, 2), function writeJSON(err) {
    // Check to see if error was thown
    if (err) return console.log(err);
    console.log("success");
  })
  // Just sent a message for testing purposes
  res.status(200).send("success");
})

// Update user's information in database
app.put('/user/:userid', (req, res, next) => {
  // Check if user exists
  if(!req.userExists){
    res.status(404).send("404:User not found");
    return;
  }
  // Get information from request
  let newData = req.body;
  // if the fields are empty skip updating the entry
  if (newData.firstName != ""){
    userData[req.userIndex].firstName = newData.firstName;
  }
  if (newData.lastName != ""){
    userData[req.userIndex].lastName = newData.lastName;
  }
  if (newData.address != ""){
    userData[req.userIndex].address = newData.address;
  }
  if (newData.city != ""){
    userData[req.userIndex].city = newData.city;
  }
  if (newData.state != ""){
    userData[req.userIndex].state = newData.state;
  }
  if (newData.zipcode != ""){
    userData[req.userIndex].zipcode = newData.zipcode;
  }
  if (newData.country != ""){
    userData[req.userIndex].country = newData.country;
  }
  // Write to the file.
  fs.writeFile('./users.json', JSON.stringify(userData, null, 2), function writeJSON(err) {
    // Check to see if error was thown
    if (err) return console.log(err);
    console.log("success");
  })

  res.status(200).json({
    token: 'success',
    user: {
      id: userData[req.userIndex].userID,
      name: `${userData[req.userIndex].firstName} ${userData[req.userIndex].lastName}`
    }
  })
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
    res.status(404).send("Not found");
    console.log("404:Not found");
    return;
  }
  // Now remove the item from the array.
  collectionData.splice(index,1);
  // Rewrite collections.json
  fs.writeFile('./collections.json', JSON.stringify(collectionData, null, 2), function writeJSON(err) {
    // Check to see if error was thown
    if (err) return console.log(err);
    console.log("success");
  })
  res.status(200).send("success");
})

// ************************* END OF DELETES *************************

// ************************* START OF POSTS *************************

// Find out how the request will work. Possibly check if item is in user collection
// Make new request
app.post('/user/:borrowerid/request/:lenderid/:gameid', (req, res, next) => {
  let foundFlag = false;
  let availableFlag = true;
  // Search the lenders collection for the game.
  for (let entry of req.collection){
    if(req.gameid == entry.GAMEINDEX) {
      foundFlag = true;
      availableFlag = entry.ALLOWBORROW;
      break;
    }
  }
  // If the game wasn't found, send an error and return.
  if(!foundFlag){
    res.status(404).send("404:Not found");
    console.log("404:Not found");
    return;
  }
  // If the game isn't available, send an error and return.
  if(!availableFlag){
    res.status(409).send("409:Item not available");
    console.log("409:Item not available");
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
      res.status(409).send("409:Already have request for that item");
      console.log("409:Already have request for that item");
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
    console.log("success");
  })
  // Just sent a message for testing purposes
  res.status(200).send("success");
})

app.post('/user', (req,res,next) => {
  // get the data from the body of the request
  console.log(req.body)
  let newData = req.body.formData;
  // Check if the email is already registered
  for(let user of userData){
    if(user.email == newData.email){
      res.status(409).send("Account already registered with this email");
      console.log("409:Account already registered with this email");
      return;
    }
  }
  // Generate a unique User ID?
  // Construct the new user entry
  let newEntry = {
    "userID": newData.email,
    "firstName": newData.firstName,
    "lastName": newData.lastName,
    "email": newData.email,
    "password": newData.password,
    "address": newData.address,
    "city": newData.city,
    "state": newData.state,
    "zipcode": newData.zipcode,
    "country": newData.country
  }
  // Push the data onto the userData
  userData.push(newEntry);

  // Write to the file.
  fs.writeFile('./users.json', JSON.stringify(userData, null, 2), function writeJSON(err) {
    // Check to see if error was thown
    if (err) return console.log(err);
    console.log("success");
  })
  // Just sent a message for testing purposes
  res.status(200).json({
    token: 'success',
    user: {
	id: newEntry.userID,
	name: `${newEntry.firstName} ${newEntry.lastName}`
    }
  })
  res.send("success");
})

// Send login request with email and password
app.post('/user/signin',(req, res, next) => {
  let loginData = req.body.formData;
  for(let entry of userData){
    if(entry.email == loginData.email){
      if(entry.password == loginData.password){
        res.status(200).json({
			token: 'success',
			user: {
				id: entry.userID,
				name: `${entry.firstName} ${entry.lastName}`
			}
		})
        console.log("Logged in user", entry.email);
        return;
      }
    }
  }
  res.status(401).send("Email and password combination not found");
})

// ************************* END OF POSTS *************************

appl.use('/api', app);

appl.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
