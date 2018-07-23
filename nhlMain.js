//intialising the teams array
let teams = [];

//Here are my own personal weighting for each field, supposedly how much I think they mean
// towards for example, wins should weigh more than power play goals agiasnt. 
//I have taken alot of thought into these weighting however, in the near future I might like
// to enable the user to edit the weightings of the variables just for personal preference
let fieldWeights = {

     wins: 8,
     winsRank: 10,
     losses: 8,
     lossesRank: 10,
     overtime: 6,
     overtimeRank: 8,
     pts: 8,
     ptsRank: 10,
     goalsPerGame: 5,
     goalsPerGameRank: 7,
     goalsAgainstPerGame: 5,
     goalsAgainstPerGameRank: 7,
     evGGARatio: 3,
     evGGARatioRank: 4,
     powerPlayPercentage: 4,
     powerPlayPercentageRank: 5,
     powerPlayGoals: 3,
     powerPlayGoalsRank: 4,
     powerPlayGoalsAgainst:	3,
     powerPlayGoalsAgainstRank:	4,
     powerPlayOpportunities: 2,
     powerPlayOpportunitiesRank: 3,
     penaltyKillOpportunities:	2.5,
     penaltyKillOpportunitiesRank:	3.5,
     penaltyKillPercentage:	4,
     penaltyKillPercentageRank:	5,
     shotsPerGame: 4.5,
     shotsPerGameRank: 5.5,
     shotsAllowed:	4.5,
     shotsAllowedRank:	4.5,
     winScoreFirst:	2,
     winScoreFirstRank:	2.5,
     winOppScoreFirst:	2.5,
     winOppScoreFirstRank:  3,
     winLeadFirstPer:	1.8,
     winLeadFirstPerRank:   2.2,
     winLeadSecondPer:	1.6,
     winLeadSecondPerRank:	2,
     winOutshootOpp:	2,
     winOutshootOppRank:	2.5,
     winOutshotByOpp:	3,
     winOutshotByOppRank:	3.5,
     winOutshotByOpp:	3.5,
     winOutshotByOppRank:	4,
     faceOffWinPercentage: 3,
     faceOffWinPercentageRank: 3,	
     savePct:	4.5,
     savePctRank:	5,
     shootingPctRank: 4.5,
     shootingPctRank: 5,
     
}



//Setting up team1STATS and team2STATS so we can parse the JSON into them, through the API
//Also, have intialised them here because need to use the stats for the Predict function

let team1STATS = [];
let team2STATS = [];


let team1NAME = "";
let team2NAME = "";

let team1RANKS = [];
let team2RANKS = [];

let team1SCORE = 0;
let team2SCORE = 0;
//calling the getTeams function so you don't have to wait for a dropdown box to be clicked for the options to load into the select boxes
getTeams();


function getTeams() {
    //here we make a new XML object so we can contact the API
    let xhttp = new XMLHttpRequest();

    //Making the request
    xhttp.open("GET","https://statsapi.web.nhl.com/api/v1/teams", true);
    //Sending the request
    xhttp.send();

    //Once we have got a response from the API (it being "ready")
    xhttp.onreadystatechange = function() {
        if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            //parsing the big long string into a JSON object, also specifying the .teams so
            //we only get the team list and not the copyright infomation at the start
            teams = JSON.parse(this.responseText).teams;

            //sorting the array alphabectically
            teams.sort(
                (x,y) => {
                    return (x.name.localeCompare(y.name));
                }
            );

            //Making sure there is intially an option in the select boxes as follows
            //this also resets the Select boxes so if you somehow call this function again
            //it will not just double up and add extra options on top of the existing ones
            teamSelect1.innerHTML = '<option value="noTeam">Please Select Team 1...</option>';
            teamSelect2.innerHTML = '<option value="noTeam">Please Select Team 2...</option>';
            
            //Runs a loop through the team array putting team id as the value and then the
            //team name as option name
            for(let i=0; i<teams.length; i++) {
                let id = teams[i].id;
                let name = teams[i].name;

                teamSelect1.innerHTML += `<option value= ${id}> ${name} </option>`;
                teamSelect2.innerHTML += `<option value= ${id}> ${name} </option>`;
            }
        }
    }
}


//This function is to be called everytime the dropdown box has its value changed.
function dropDownChange1() {

//x here is the value that is in team select select list, in mine it corresponds to team id so we can use it here to find mutiple things, such as API request and picture. 
    let x = document.getElementById("teamSelect1").value;
    //Checking if the value is actually a number (so I know whether someone has actually chosen a team)
    if (!isNaN(x))
    {
        //Changing the picture to the according team, as well as setting up output
        output1.innerHTML = "";
        team1IMG.src = "/Images/" + x + ".png";
        team1IMG.hidden = false;
        

        //Making the request to the API
        let xhttp = new XMLHttpRequest();
        xhttp.open("GET","https://statsapi.web.nhl.com/api/v1/teams/" + x + "/stats", true);
        xhttp.send();

        //When the API responds with the data
        xhttp.onreadystatechange = function() {
        if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {

            //We are only parsing the specific stats data, we had to go quite deep into the file to get this
            team1STATS = JSON.parse(this.responseText).stats[0].splits[0].stat;

            //Here we parse the name of the team into the team name variable, for use in later functions
            //This also prevents us having to contact the API all over again in the later function
            team1NAME = JSON.parse(this.responseText).stats[0].splits[0].team.name;

            //Parsing into a ranks object, for use later on in our predict function
            team1RANKS = JSON.parse(this.responseText).stats[1].splits[0].stat;

            //Getting stats for the team according to the data just read from the API - LIVE STATS :D
            //I have chosen do use "<span>" here because I wanted to edit the labels seperatedly in CSS
            output1.innerHTML += '<span class="output1LABELS"> Games Played: </span>' +
             team1STATS.gamesPlayed + "<br>" + '<span class="output1LABELS">Wins: </span>' + 
             team1STATS.wins + "<br>" + '<span class="output1LABELS">Losses: </span>' + 
             team1STATS.losses + "<br>" + '<span class="output1LABELS">Goals Per Game: </span>' + 
             team1STATS.goalsPerGame + "<br>" + '<span class="output1LABELS">Goals Agaisnt Per Game: </span>' + 
             team1STATS.goalsAgainstPerGame + "<br>" + '<span class="output1LABELS">Total Pts: </span>' +  
             team1STATS.pts + "<br>";


        }
    }}
    //The outcome if we do not have a team chosen
    else {
        output1.innerHTML = "Please Select Team 1";
        team1IMG.hidden = true;
        
    }
  

}
//Here we repeat the same process of events that occured in our dropDownChange1
function dropDownChange2() {
    let y = document.getElementById("teamSelect2").value;
    if (!isNaN(y))
    {
       output2.innerHTML = "Team ID: " + y;
        team2IMG.src = "/Images/" + y + ".png";
        team2IMG.hidden = false;
        output2.innerHTML = "";
        let xhttp = new XMLHttpRequest();
        xhttp.open("GET","https://statsapi.web.nhl.com/api/v1/teams/" + y + "/stats", true);
        xhttp.send();
        xhttp.onreadystatechange = function() {
            if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                team2STATS = JSON.parse(this.responseText).stats[0].splits[0].stat;
                team2NAME = JSON.parse(this.responseText).stats[0].splits[0].team.name;
                team2RANKS = JSON.parse(this.responseText).stats[1].splits[0].stat;

                output2.innerHTML += '<span class="output2LABELS"> Games Played: </span>' + 
                team2STATS.gamesPlayed + "<br>" + '<span class="output2LABELS">Wins: </span>' + 
                team2STATS.wins + "<br>" + '<span class="output2LABELS">Losses: </span>' + 
                team2STATS.losses + "<br>" + '<span class="output2LABELS">Goals Per Game: </span>' + 
                team2STATS.goalsPerGame + "<br>" + '<span class="output2LABELS">Goals Agaisnt Per Game: </span>' + 
                team2STATS.goalsAgainstPerGame + "<br>" + '<span class="output2LABELS">Total Pts: </span>' +  
                team2STATS.pts + "<br>";
            }
        }
    }
    else {
        output2.innerHTML = ' <span class= "pleaseSelect2" > Please Select Team 2 </span>';
        //Using span here was just a bugfix because the pleaseSelect2 text wasn't properly aligned but the div was fine when it was showing stat text
        //So by using span just when I have Please Select Team 2 it lets me position this element individually in css


        team2IMG.hidden = true;
    }
   
    

}

/* Declaring a function so we can easily call this function continiously, feeding various
fields and weights into it. */
function compare(team1FIELD,team2FIELD,weight) {

    /* addScore is what we will add to either compare score a.k.a the weighted difference 
    between the two variables */
    let addScore = 0;

    /* here we are setting addScore to the absolute difference between the fields
    multiplied by the weighting I have chosen  */
    addScore = Math.abs((team1FIELD - team2FIELD)*weight)

    console.log(addScore + " This is the addScore");

    
    if (team1FIELD === team2FIELD) {
    //do nothing
    }
    else {

        if (team1FIELD > team2FIELD) {
           team1SCORE = team1SCORE + addScore;
        }
        else {
            team1SCORE = team1SCORE + addScore;
        }
}


}
function compareRANK(team1FIELD, team2FIELD,weight) {
    let extract1 = 0;
    let extract2 = 0;
    let rankWeight = weight*10;
    extract1 = Number(team1FIELD.slice(0,-2));
    console.log(extract1);
    extract2 = Number(team2FIELD.slice(0,-2));
    console.log(extract2)
    compare(extract1,extract2,rankWeight);
}
function predict() {
    //Assigning t1 and t2 which are the values of the select boxes, this is so we can do some
    // data validation
    let t1 = document.getElementById("teamSelect1").value;
    let t2 = document.getElementById("teamSelect2").value;

    //Here some data validation checking if the user has chosen two teams
    //Also makes sure the teams are not the same 
    if ((t1 === "noTeam" || t2 === "noTeam") || (t1 === t2)) {
        alert("Please Select Two Different Teams");
    }

    //Here is where the real "Predicting" is about to take place
    else {
        team1SCORE = 0;
        team2SCORE = 0;
    

    console.log(team1NAME);
    console.log(team2NAME);

    compare(team1STATS.wins,team2STATS.wins,fieldWeights.wins);
    compareRANK(team1RANKS.wins,team2RANKS.wins,fieldWeights.winsRank);


    console.log(team1SCORE + " This is Team 1 Score");
    console.log(team2SCORE + " This is Team 2 Score");




    }

}
