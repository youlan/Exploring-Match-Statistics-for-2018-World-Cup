    /**
     * Loads in the table information from fifa-matches-2018.json
     */
//d3.json('data/fifa-matches-2018.json').then( data => {

    /**
     * Loads in the tree information from fifa-tree-2018.csv and calls createTree(csvData) to render the tree.
     *
     */
    //d3.csv("data/fifa-tree-2018.csv").then(csvData => {

        //Create a unique "id" field for each game
       // csvData.forEach( (d, i) => {
          //  d.id = d.Team + d.Opponent + i;
        //});

        //Create Tree Object
        //let tree = new Tree();
       // tree.createTree(csvData);

        //Create Table Object and pass in reference to tree object (for hover linking)

      //  let table = new Table(data,tree);

      //  table.createTable();
       // table.updateTable();
   // });
//});



// // ********************** HACKER VERSION ***************************
/**
 * Loads in fifa-matches-2018.csv file, aggregates the data into the correct format,
 * then calls the appropriate functions to create and populate the table.
 *
 */

d3.csv("data/fifa-matches-2018.csv").then(matchesCSV => {
    let teamData;
    teamData = d3.nest()
        .key(d => {
            return d.Team;
        })
        .rollup(function (leaves) {
            let typeData = {
                "Group": 0,
                "Round of Sixteen": 1,
                "Quarter Finals": 2,
                "Semi Finals": 3,
                "Fourth Place": 4,
                "Third Place": 5,
                "Runner-Up": 6,
                "Winner": 7
            };

            function gameData(leaveData){
                let Games;
                Games = d3.nest().key(d => d.Opponent)
                    .rollup(function(leaves){
                        let values = {
                            "Delta Goals": "",
                            "Goals Conceded": leaves[0]["Goals Conceded"],
                            "Goals Made": leaves[0]["Goals Made"],
                            "Losses": "",
                            "Result": {"label": leaves[0].Result, "ranking": typeData[leaves[0].Result]},
                            "Wins": "",
                            "Opponent": leaves[0].Team,
                            "type": "game"
                        };
                        return values
                        })
                    .entries(leaveData);
                //console.log(Games);
                return Games;
            }

            let Wins = d3.sum(leaves, d => d.Wins);
            let GoalsMade = d3.sum(leaves, d=>d["Goals Made"]);
            let GoalsConceded = d3.sum(leaves, d=> d["Goals Conceded"]);
            let DeltaGoals = d3.sum(leaves, d=>d["Delta Goals"]);
            let Losses = d3.sum(leaves, d=>d.Losses);
            let TotalGames = d3.sum(leaves, d=>1);
            let ranking = d3.max(leaves, d => typeData[d.Result]);
            let label = Object.keys(typeData).find(key => typeData[key] === ranking );
        let tempValue ={
            "Goals Made": GoalsMade, "Goals Conceded": GoalsConceded,
            "Delta Goals": DeltaGoals, "Wins": Wins, "Losses": Losses,
            "Result": {"label": label, "ranking": ranking},
            "TotalGames": TotalGames, "type": "aggregate",
            "games": gameData(leaves)
        };

        //console.log(leaves);

        return tempValue;
        })
        .entries(matchesCSV);
    //console.log(teamData);
//     /**
//      * Loads in the tree information from fifa-tree-2018.csv and calls createTree(csvData) to render the tree.
//      *
//      */
    d3.csv("data/fifa-tree-2018.csv").then(treeCSV => {


//     // ******* TODO: PART I *******
        treeCSV.forEach( (d, i) => {
            d.id = d.Team + d.Opponent + i;
            //console.log(d);
        });

        //Create Tree Object
        let tree = new Tree();
        //console.log(treeCSV);
        tree.createTree(treeCSV);

        //Create Table Object and pass in reference to tree object (for hover linking)

        let table = new Table(teamData,tree);

        table.createTable();
        table.updateTable();


       });

 });
// ********************** END HACKER VERSION ***************************
