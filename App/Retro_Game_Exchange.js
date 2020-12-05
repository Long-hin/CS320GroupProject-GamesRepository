/*
* Description here
*
*
 */

//Class that represents the database. Contains all the catalogued items and the user list. Includes the following methods:
//search(query): Searches the database for items containing the given name.
//findUsersWithItem(query): finds users who have the given item in their collection
class CollectionDatabase{
  constructor(data){
    this.dataDictionary = [];
    //iterate across the given data, creating a new database entry for each entry in the data.
    //i is the current generated item ID, start at 10000 and go up. Probably will change it later so the first digit corresponds to the console or something.
    let i = 10000;
    for(let entry of data){
      this.dataDictionary.push(new DatabaseEntry(entry,i));
      i++;
    }
    //Need to construct user list next, not sure how or where that data will be stored.
  }

  //Just search for name? or all fields?
  search(query){

  }

  //Give a name? or give an ID? Maybe a button on the items page will auto search for users.
  findUsersWithItem(query){

  }
}

class DatabaseEntry{
  constructor(entry,id){
    this.ID = id;
    this.gameConsole=entry.CONSOLE;
    this.title = entry.TITLE;
    this.url = entry.URL;
    this.developer = entry.DEVELOPER;
    this.publisher = entry.PUBLISHER;
    this.releaseDate = entry.RELEASE_DATE;
    this.genre = entry.GENRE;
  }
}

//find out how user's data is going to be stored.
class User{

}

//find out how user's data is going to be stored.
class Collection{

}

class CollectionItem{
  constructor(ID){
    this.ID=ID;
    this.borrowStatus = false;
    this.borrowProhibitied = false;
  }
  updateBorrowStatus(){
    this.borrowStatus = !this.borrowStatus;
  }
  updateBorrowProhibited(){
    this.borrowProhibited = !this.borrowProhibited;
  }
}

class BorrowRequest{
  constructor(isLender,items,date){
    this.isLender=isLender;
    this.items=items;
    this.approvalStatus=false;
    this.date=date;
    this.returnStatus=false;
    this.returnDate='N/A';
  }
  //Set the approval status to true and set the return date
  approveRequest(returnDate){
    this.approvalStatus=true;
    this.returnDate=returnDate;
  }
  denyRequest(){
    //Probably don't need this here, since it needs to be removed from the object holding the requests list
  }
}
//**EVERYTHING BELOW THIS LINE WAS FOR MY OWN TESTING**
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
const databaseTest=new CollectionDatabase(database);
console.log(databaseTest);

