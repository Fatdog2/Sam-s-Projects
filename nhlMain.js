//intialising the teams array as a global (for use in getTeams and both dropDowns)
let teams = [];

//Initialising team id's as globals, we do this here because we need to use the team id's in
// other functions
let teamid1 = 0;
let teamid2 = 0;

/* Here are my own personal weighting for each field, supposedly how much I think they mean
 towards for example, wins should weigh more than power play goals agiasnt. 
 I have taken alot of thought into these weighting however, in the near future I might like
 to enable the user to edit the weightings of the variables just for personal preference */

 let fieldWeights = {};
 // let fieldWeights = {

//      wins: 25,
//      winsRank: 30,
//      losses: 20,
//      lossesRank: 25,
//      ot: 6,
//      otRank: 8,
//      pts: 8,
//      ptsRank: 10,
//      goalsPerGame: 5,
//      goalsPerGameRank: 7,
//      goalsAgainstPerGame: 5,
//      goalsAgainstPerGameRank: 7,
//      evGGARatio: 3,
//      evGGARatioRank: 4,
//      powerPlayPercentage: 4,
//      powerPlayPercentageRank: 5,
//      powerPlayGoals: 3,
//      powerPlayGoalsRank: 4,
//      powerPlayGoalsAgainst:	3,
//      powerPlayGoalsAgainstRank:	4,
//      powerPlayOpportunities: 2,
//      powerPlayOpportunitiesRank: 3,
//      penaltyKillOpportunities:	2.5,
//      penaltyKillOpportunitiesRank:	3.5,
//      penaltyKillPercentage:	4,
//      penaltyKillPercentageRank:	5,
//      shotsPerGame: 4.5,
//      shotsPerGameRank: 5.5,
//      shotsAllowed:	4.5,
//      shotsAllowedRank:	4.5,
//      winScoreFirst:	2,
//      winScoreFirstRank:	2.5,
//      winOppScoreFirst:	2.5,
//      winOppScoreFirstRank:  3,
//      winLeadFirstPer:	1.8,
//      winLeadFirstPerRank:   2.2,
//      winLeadSecondPer:	1.6,
//      winLeadSecondPerRank:	2,
//      winOutshootOpp:	2,
//      winOutshootOppRank:	2.5,
//      winOutshotByOpp:	3,
//      winOutshotByOppRank:	3.5,
//      winOutshotByOpp:	3.5,
//      winOutshotByOppRank:	4,
//      faceOffWinPercentage: 3,
//      faceOffWinPercentageRank: 3,	
//      savePctg:	4.5,
//      savePctRank:	5,
//      shootingPct: 4.5,
//      shootingPctRank: 5,
     
// }

let database = firebase.database();

let fieldWRef = database.ref('/fieldWeights');

fieldWRef.once('value').then((data) => {fieldWeights = data.val();});

// fieldWRef.update(fieldWeights);




//Setting up team1STATS and team2STATS so we can parse the JSON into them, through the API
//Also, have intialised them here because need to use the stats for the Predict function

let team1STATS = [];
let team2STATS = [];

//Setting up some more globals that we need to use in different functions (therefore requring
//  making them globals)

//These are the 2 names we get from the dropDown function and use them later on when we write  message
let team1NAME = "";
let team2NAME = "";

//The ranks we get from the dropDown function and use in the compareRank function
let team1RANKS = [];
let team2RANKS = [];

//These team scores are used in the 'predicting' win percents
let team1SCORE = 0;
let team2SCORE = 0;

//This is a global flag. I am doing this so the dropDowns know what is going on.
let predictHasRun = false;

//These two flags are here so if the user tries to run predict before stats have been retrieved
// it does not bug out the program, and instead provides an error message
let team1StatsDONE = false;
let team2StatsDONE = false;



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

    //Setting this to false here because if the user tries to click predict before stats have been retrieved I can deny predict
    team1StatsDONE = false;

//x here is the value that is in team select select list, in mine it corresponds to team id so we can use it here to find mutiple things, such as API request and picture. 
    teamid1 = document.getElementById("teamSelect1").value;
    //Checking if the value is actually a number (so I know whether someone has actually chosen a team)
    if (!isNaN(teamid1))
    {
        //Changing the picture to the according team, as well as setting up output
        output1.innerHTML = "";
        team1IMG.src = "/Images/" + teamid1 + ".png";
        team1IMG.hidden = false;
        

        //Making the request to the API
        let xhttp = new XMLHttpRequest();
        xhttp.open("GET","https://statsapi.web.nhl.com/api/v1/teams/" + teamid1 + "/stats", true);
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

            //Getting stats for the team according to the data just read from the API - LIVE STATS
            //I have chosen do use "<span>" here because I wanted to edit the labels seperatedly in CSS
            output1.innerHTML += '<span class="output1LABELS"> Games Played: </span>' +
             team1STATS.gamesPlayed + "<br>" + '<span class="output1LABELS">Wins: </span>' + 
             team1STATS.wins + "<br>" + '<span class="output1LABELS">Losses: </span>' + 
             team1STATS.losses + "<br>" + '<span class="output1LABELS">Goals Per Game: </span>' + 
             team1STATS.goalsPerGame + "<br>" + '<span class="output1LABELS">Goals Agaisnt Per Game: </span>' + 
             team1STATS.goalsAgainstPerGame + "<br>" + '<span class="output1LABELS">Total Pts: </span>' +  
             team1STATS.pts + "<br>";

            if (predictHasRun === true) {
                dropDownChange2();
                predictHasRun = false;
                matchupText.innerHTML = "";
                
            }
            
            //Setting the flag back to true, now that stats have been completely retrieved
            team1StatsDONE = true;
        }
    }}
    //The outcome if we do not have a team chosen, is hiding the picture and switching to default text
    else {
        output1.innerHTML = "Please Select Team 1";
        team1IMG.hidden = true;
        
    }

}

//Here we repeat the same process of events that occured in our dropDownChange1
function dropDownChange2() {

    team2StatsDONE = false;

    teamid2 = document.getElementById("teamSelect2").value;
    if (!isNaN(teamid2))
    {
         output2.innerHTML = "Team ID: " + teamid2;
        team2IMG.src = "/Images/" + teamid2 + ".png";
        team2IMG.hidden = false;
        output2.innerHTML = "";
        let xhttp = new XMLHttpRequest();
        xhttp.open("GET","https://statsapi.web.nhl.com/api/v1/teams/" + teamid2 + "/stats", true);
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

               

                if (predictHasRun === true) {
                    dropDownChange1();
                    predictHasRun = false;
                    matchupText.innerHTML = "";
                    
                }
            team2StatsDONE = true;
            }
        }
    }
    else {
        output2.innerHTML = ' <span class= "pleaseSelect2" > Please Select Team 2 </span>';
        //Using span here was just a bugfix because the pleaseSelect2 text wasn't properly aligned but the div was fine when it was showing the stat text
        //So by using span just when I have Please Select Team 2 it lets me position this element individually in CSS


        team2IMG.hidden = true;
    }


}

//Setting addScore as a global here, because we request it in other functions
let addScore = 0

/* Declaring a function so we can easily call this function continiously, feeding various
fields and weights into it. */
function compare(field) {

    /*
    
     */
    let team1FIELD = team1STATS[field];
    let team2FIELD = team2STATS[field];
    let weight = fieldWeights[field];

    /* addScore is what we will add to either compare score a.k.a the weighted difference 
    between the two variables */
    addScore = 0;

    /* here we are setting addScore to the absolute difference between the fields
    multiplied by the weighting I have chosen  */
    addScore = Math.abs((team1FIELD - team2FIELD)*weight)


    
    if (team1FIELD === team2FIELD) {
    //do nothing
    }
    else {
        //refer to the compareScore function here, we use this here so I can 
        // differentiate between some specific fields
        compareScore(team1FIELD,team2FIELD,field)
}


}
//This is the compare rank function, 
function compareRANK(field) {
    
    //Initiliasing rankField 
    let rankField = "";

    //Cutting off the word "Rank" from the end of the word
    rankField = field.slice(0,-4);

    //This if statement is a bugfix here, the reason being 
    // the actual JSON object has 2 fields which do not have the same naming convention
    // as the rest of the fields in the JSON so we need to do some tiny bit of manipulating 
    // so our algorithm runs smoothly.
    if (rankField === 'savePct' || 'shootingPct')
    {
        if (rankField === 'savePct') {
            rankField = 'savePctRank'
        }
        else if (rankField === 'shootingPct') {
            rankField = 'shootingPctRank'
        }
    }
   
    //Setting team1FIELD and team2FIELD to the corresponding variable in the RANKS objects
    let team1FIELD = team1RANKS[rankField];
    let team2FIELD = team2RANKS[rankField];

    //We do this for the weight as well
    let weight = fieldWeights[rankField];

    //Extract is initilised here because we end up getting back postfixes such as 
    // "st" and "th" on the end of words 
    let extract1 = 0;
    let extract2 = 0;

    
    //Here we just slice off the postfixes and then change it from a string to a number
    extract1 = Number(team1FIELD.slice(0,-2));
   
    extract2 = Number(team2FIELD.slice(0,-2));
    
    //Resetting addScore
    addScore = 0;

    //Setting addScore to the absolute difference between the two fields, then multipling
    // the difference by the weights 
    addScore = Math.abs((extract1 - extract2)*weight)
    if (extract1 === extract2) {
        //do nothing
        }
        else {
            
            //Here we add addScore on the the team which ended up having the greater field
            if (extract1 < extract2) {
               team1SCORE = team1SCORE + addScore;
            }
            else {
                team2SCORE = team2SCORE + addScore;
            }
    }


    
}

//This whole compareScore function adds the addScore to which ever field is "better"
function compareScore(score1,score2,field) {

    /* Here we are checking for fields which we need to switch the test from "is greater than"
    to "is less than", we do this here because having more losses is not good */
    if (field === "losses" || "goalsAgaisntPerGame" || "powerPlayGoalsAgaisnt" || "shotsAllowed") {
        if (score1 < score2) {
            team1SCORE = team1SCORE + addScore;
        }
        else {
            team2SCORE = team2SCORE + addScore;
        }
    }
    else {
        if (score1 > score2) {
            team1SCORE = team1SCORE + addScore;
         }
         else {
             team2SCORE = team2SCORE + addScore;
         }
    }
}
function predict() {
    if ((team1StatsDONE === false) || (team2StatsDONE === false)) {
   
    let t1 = document.getElementById("teamSelect1").value;
    let t2 = document.getElementById("teamSelect2").value;

    //Here some data validation checking if the user has chosen two teams
    //Also makes sure the teams are not the same 
    if ((t1 === "noTeam" || t2 === "noTeam") || (t1 === t2)) {
        alert("Please Select Two Different Teams");
    }
    else {
        alert("Both stats need to be retrieved first, not everythings instant.")
    }

    }

    else {
    
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

        //Resetting the team scores to 0
        team1SCORE = 0;
        team2SCORE = 0;
    

   //Getting a loop to go through all the attributes in field weights
   
    for (let stat in fieldWeights) {
        // "stat" is the field that is being fed through
    


        /* Here we check if the field is a "Rank" field or a normal field, then we run the 
         corresponding function for it */
        if (stat.slice(-4) === "Rank")
        {
            compareRANK(stat);
        }
        else {
            compare(stat);
        }
    
       
    }




//Here we commence the calculating of Win Percent for either teams, then displaying the text

let totalSCORE = 0;

//Creating the Total Score
totalSCORE =  team1SCORE + team2SCORE;

    
    let team1WP = 0;

    /* Win Percent is made by finding out what percent the score is of the totalScore also 
    using "toFixed" to round it off to 1 d.p */
    team1WP = ((team1SCORE/totalSCORE)*100).toFixed(1)

    //Using span so we can edit the look of how the win percent is displayed
    output1.innerHTML = '<span id= "team1WPtext" class= "team1WP"> <span>'

    //Now editing the actual <span>
    team1WPtext.innerHTML = team1WP + "%";

    //Doing the same process for team2
    let team2WP = 0;
    team2WP = ((team2SCORE/totalSCORE)*100).toFixed(1)
    output2.innerHTML = '<span id= "team2WPtext" class= "team2WP"> <span>'
    team2WPtext.innerHTML = team2WP + "%";

    //Here we change the colours of the win percents according to who has the higher one
    //Doing this witht he JQuery "addClass" and "removeClass" functions which just add and remove the colours
    if (team1WP > team2WP) {
        $(team1WPtext).removeClass("loseColour");
        $(team2WPtext).removeClass("winColour");
        matchupText.innerHTML = team1NAME + " are " + (team1WP/team2WP).toFixed(2) + " times more likely to win than the " + team2NAME;
        $(team1WPtext).addClass("winColour");
        $(team2WPtext).addClass("loseColour");
    }   
    else {
        $(team1WPtext).removeClass("winColour");
        $(team2WPtext).removeClass("loseColour");
        matchupText.innerHTML = team2NAME + " are " + (team2WP/team1WP).toFixed(2) + " times more likely to win than the " + team1NAME;
        $(team1WPtext).addClass("loseColour");
        $(team2WPtext).addClass("winColour");
    }
    //The predict flag setting to true
   predictHasRun = true;
    }

    }
}
