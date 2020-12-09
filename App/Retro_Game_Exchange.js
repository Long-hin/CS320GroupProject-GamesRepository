/*
* Description here
*
*
 */

// Class that represents the database. Contains all the catalogued items and the user list. Includes the following
// methods:
// search(query): Searches the database for items containing the given name.
// findUsersWithItem(query): finds users who have the given item in their collection
class CollectionDatabase{
  constructor(data){
    this.dataDictionary = [];
    // iterate across the given data, creating a new database entry for each entry in the data.
    // i is the current generated item ID, start at 10000 and go up. Probably will change it later so the first digit
    // corresponds to the console or something.
    let i = 10000;
    for(let entry of data){
      this.dataDictionary.push(new DatabaseEntry(entry,i));
      i++;
    }
    // Need to construct user list next, not sure how or where that data will be stored.
  }

  // Just search for name? or all fields?
  search(query){
    var i, filter, table, tr, td, txtV;
    filter = query.value.toUpperCase();
    table = document.getElementById(this.dataDictionary);
    tr = table.getElementsByTagName("Title")
for (i = 0; i < this.dataDictionary.length; i++){

}
  }

  // Give a name? or give an ID? Maybe a button on the items page will auto search for users.
  findUsersWithItem(query){

  }
}

// This class represents an entry in the database. No methods are included since its just data storage.
class DatabaseEntry{
  constructor(entry,id){
    this.ID = id;
    this.Console=entry.CONSOLE;
    this.title = entry.TITLE;
    this.url = entry.URL;
    this.developer = entry.DEVELOPER;
    this.publisher = entry.PUBLISHER;
    this.releaseDate = entry.RELEASE_DATE;
    this.genre = entry.GENRE;
  }
}

// find out how user's data is going to be stored.
class User{

}

// This class represents a user's collection. Should be attached to the class storing the users information.
class Collection{
  // The constructor takes a link to the collectionDatabase object and the name of the user.
  constructor(user,collectionDatabase){
    this.user = user;
    this.collection = [];
    // Iterate through the collection database, finding all collection entries that are related to the user and adding
    // them to the collection array.
    for(let entry of collectionDatabase){
      if(user.localeCompare(entry.USER) == 0){
        this.collection.push(new CollectionItem(entry));
      }
    }
  }

  // This method adds items to an already built collection. Takes the ID of the item and a boolean that states if the
  // item is allowed to be borrowed or not.
  // Returns 0 if successfully added, returns -1 if item is already in the collection.
  addItem(ID,allowBorrow){
    // Check if the item is already in the collection.
    if(this.existenceCheck(ID)) return -1;
    // Build a new entry for the collection.
    const newItem = {
      "USER":this.user,
      "GAMEINDEX":ID,
      "ALLOWBORROW":allowBorrow,
      "STATUS":"available"
    };
    // Push the entry onto the collection array.
    this.collection.push(new CollectionItem(newItem));
    return 0;
  }

  // This method removes an item from an already built collection. Takes the ID of the item to remove.
  // Returns -1 if the item isn't in the collection, returns 0 if item is successfully removed.
  removeItem(ID){
    const index = this.findItem(ID);
    if(index == -1){
      return -1;
    }
    this.collection.splice(index,1);
    return 0;
  }

  // This method takes an Item ID and returns a boolean if the item exists in the collection or not.
  existenceCheck(ID){
    if(this.findItem(ID) == -1) return false;
    return true;
  }

  // This method takes an item ID and returns the index of its location in the users collection array.
  // Returns -1 if the item isn't in the array.
  findItem(ID){
    // Index tracks where in the array we are
    let index=0;
    // Iterate across the collection array, if the current entries ID is equal to the given, return the index.
    for(let entry of this.collection) {
      if (entry.ID == ID) {
        return index;
      }
      index++;
    }
    // If the item isn't found, return -1;
    return -1;
  }
}

// This class represents an entry in a users collection. Methods include:
// updateBorrowStatus(): change the availability status of the entry;
// updateBorrowProhibited(): change the allowBorrow flag of the entry
class CollectionItem{
  // Constructor takes an object as detailed in sample_collections.js
  constructor(entry){
    this.user = entry.USER;
    this.ID = entry.GAMEINDEX;
    this.borrowStatus = entry.STATUS;
    this.allowBorrow = entry.ALLOWBORROW;
  }

  // Simply swaps the borrowStatus flag.
  updateBorrowStatus(){
    this.borrowStatus = !this.borrowStatus;
  }

  // Simply swaps the allowBorrow flag.
  updateBorrowProhibited(){
    this.allowBorrow = !this.borrowProhibited;
  }
}

// This class represents a pending borrow request. Methods include:
// approveRequest(): flags the request as approved and modifies appropriate fields.
// denyRequest():
class BorrowRequest{
  // Constructor takes a flag for if the attached user is a Lender or borrower, an array of the requested items, and
  // a date when sent. (date might not be necessary.)
  constructor(isLender,items,date){
    this.isLender=isLender;
    this.items=items;
    this.approvalStatus=false;
    this.date=date;
    this.returnStatus=false;
    this.returnDate='N/A';
  }
  // Set the approval status to true and set the return date
  approveRequest(returnDate){
    this.approvalStatus=true;
    this.returnDate=returnDate;
  }
  denyRequest(){
    // Probably don't need this here, since it needs to be removed from the object holding the requests list
  }
}

// **EVERYTHING BELOW THIS LINE WAS FOR MY OWN TESTING**
const database = [
  {
    "CONSOLE":"NES",
    "TITLE":"The Miracle Piano Teaching System",
    "URL":"https://en.wikipedia.org/wiki/Miracle_Piano_Teaching_System",
    "DEVELOPER":"Software Toolworks",
    "PUBLISHER":"Software Toolworks",
    "RELEASE_DATE":"1990",
    "GENRE":""
  },
  {
    "CONSOLE":"NES",
    "TITLE":"10-Yard Fight",
    "URL":"https://en.wikipedia.org/wiki/10-Yard_Fight",
    "DEVELOPER":"Irem",
    "PUBLISHER":"Nintendo",
    "RELEASE_DATE":"18-Oct-85",
    "GENRE":""
  },
  {
    "CONSOLE":"NES",
    "TITLE":"Baseball",
    "URL":"https://en.wikipedia.org/wiki/Baseball_(1983_video_game)",
    "DEVELOPER":"Nintendo",
    "PUBLISHER":"Nintendo",
    "RELEASE_DATE":"18-Oct-85",
    "GENRE":""
  }
]
var collections = [
  {
    "USER":"Hank",
    "GAMEINDEX":"10005",
    "ALLOWBORROW":"true",
    "STATUS":"available"
  },
  {
    "USER":"Hank",
    "GAMEINDEX":"10006",
    "ALLOWBORROW":"true",
    "STATUS":"available"
  },
  {
    "USER":"Hank",
    "GAMEINDEX":"10015",
    "ALLOWBORROW":"true",
    "STATUS":"available"
  },
  {
    "USER":"Hank",
    "GAMEINDEX":"10032",
    "ALLOWBORROW":"true",
    "STATUS":"available"
  },
  {
    "USER":"Dean",
    "GAMEINDEX":"70113",
    "ALLOWBORROW":"true",
    "STATUS":"available"
  },
  {
    "USER":"Dean",
    "GAMEINDEX":"80021",
    "ALLOWBORROW":"false",
    "STATUS":"private"
  },
  {
    "USER":"Yuuko",
    "GAMEINDEX":"10057",
    "ALLOWBORROW":"true",
    "STATUS":"available"
  },
  {
    "USER":"Yuuko",
    "GAMEINDEX":"10067",
    "ALLOWBORROW":"true",
    "STATUS":"available"
  },
  {
    "USER":"Yuuko",
    "GAMEINDEX":"10089",
    "ALLOWBORROW":"true",
    "STATUS":"available"
  },
  {
    "USER":"Yuuko",
    "GAMEINDEX":"10134",
    "ALLOWBORROW":"true",
    "STATUS":"available"
  }
];

const databaseTest=new CollectionDatabase(database);
console.log(databaseTest);

const collectionTest = new Collection('Hank',collections);
console.log(collectionTest);

collectionTest.removeItem(10006);
console.log(collectionTest);

console.log(collectionTest.existenceCheck(10005));

collectionTest.addItem(10009,true);
console.log(collectionTest);

collectionTest.removeItem(10009);
console.log(collectionTest);
