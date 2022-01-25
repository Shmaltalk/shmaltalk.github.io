import * as csv from './jquery.csv.js';
// import { parse } from 'path/to/csv/index.js'
'use strict';


const emails = {data: []};
const people = {data: []};
const year = {year: 2020};

// Upload and store CSV Data
function uploadCSV (buttonID, saveLocation) {

  /*------ Method for read uploded csv file ------*/
  uploadCSV.prototype.getCsv = function(e) {

      let input = document.getElementById(buttonID);
      input.addEventListener('change', function() {
        let reader = new FileReader();

        if (this.files && this.files[0]) {

            let myFile = this.files[0];

            reader.addEventListener('loadend', function(e) { // triggered by readAsText
              saveLocation.data = $.csv.toObjects(e.target.result);
              console.log(emails.data)
            });

            reader.readAsText(myFile);
        }
      });
  }
}

//Setup Email CSV Saving
var parseEmailCSV = new uploadCSV('inputEmailsCSV', emails);
parseEmailCSV.getCsv();

//Setup People CSV Saving
var parsePeopleCSV = new uploadCSV('inputPeopleCSV', people);
parsePeopleCSV.getCsv();

// Get year
let input = document.getElementById('year');
input.addEventListener('change', function() {
  year.year = this.valueAsNumber;
});

// GO Button
const csv_creator = document.querySelector('.go-button');
csv_creator.addEventListener('click', function() {
  finalParse();
  
});

// parse CSVs

function finalParse () {
  // we use two dicts like this to avoid duplicate emails
  let KnackID2Data = {};
  let Email2KnackID = {};

  const lastAcceptDate = new Date("05/01/"+year.year)

  // get map from KnackID to preferred first and last name
  people.data.forEach(e => {
    // let gradYear = e["Est Grad Year"].split();
    let date = new Date(e["Est Grad Year"]);
    
    if (isNaN(date) || date >= lastAcceptDate){

      if (e["PreferredName"]){
        e["PeopleName: First"] = e["PreferredName"];
      }

      KnackID2Data[e["KnackID"]] = {
        "First Name": e["PeopleName: First"],
        "Last Name": e["PeopleName: Last"],
        "KnackID": e["KnackID"]
      }
    }
  });

  // get map from email to KnackID
  emails.data.forEach(e => {
    if ((e["KnackID"] in KnackID2Data)) {
      Email2KnackID[e["Email"]] = e["KnackID"];
    }
  });

  let csvFormat = [["First Name", "Last Name", "KnackID", "Email"]];
  
  // build list of data
  Object.keys(Email2KnackID).forEach(function(email) {
    let idData = KnackID2Data[Email2KnackID[email]]; // name and id
    let tempRow = [idData["First Name"], idData["Last Name"], idData["KnackID"], email];
    csvFormat.push(tempRow);
  });

  // change list to proper string
  let csvContent = "data:text/csv;charset=utf-8," + csvFormat.map(e => e.join(",")).join("\n");
  downloadFile(csvContent);
  
}

function downloadFile (csvContent) {
  
  var encodedUri = encodeURI(csvContent);
  var tempLink = document.createElement("a");
  tempLink.setAttribute("href", encodedUri);
  tempLink.setAttribute("download", "final_data.csv");
  document.body.appendChild(tempLink); // Required for FF

  tempLink.click(); // This will download the data file named "my_data.csv".
}
