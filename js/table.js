/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object
     */
    constructor(teamData, treeObject) {

        // Maintain reference to the tree object
        this.tree = treeObject;

        /**List of all elements that will populate the table.*/
        // Initially, the tableElements will be identical to the teamData
        this.tableElements = teamData.slice();

        ///** Store all match data for the 2018 Fifa cup */
        this.teamData = teamData;

        this.tableHeaders = ["Delta Goals", "Result", "Wins", "Losses", "TotalGames"];

        /** letiables to be used when sizing the svgs in the table cells.*/
        this.cell = {
            "width": 70,
            "height": 20,
            "buffer": 15
        };

        this.bar = {
            "height": 20
        };

        /** Set variables for commonly accessed data columns*/
        this.goalsMadeHeader = 'Goals Made';
        this.goalsConcededHeader = 'Goals Conceded';

        /** Setup the scales*/
        let maxGoals = d3.max(this.teamData, d=> d.value[this.goalsMadeHeader]);
        this.goalScale = d3.scaleLinear()
            .domain([0, maxGoals])
            .range([0, 2*this.cell.width])
            .nice();


        /** Used for games/wins/losses*/
        let maxGames = d3.max(this.teamData, function(d){
            return d.value["TotalGames"];
        });
        //console.log(maxGoals);
        //console.log(maxGames);
        this.gameScale = d3.scaleLinear()
            .domain([0, maxGames])
            .range([0, this.cell.width-this.cell.buffer]);

        /**Color scales*/
        /**For aggregate columns*/
        /** Use colors '#feebe2' and '#690000' for the range*/
        this.aggregateColorScale = d3.scaleLinear()
            .domain([0, maxGames])
            .range(['#feebe2', '#690000']);


        /**For goal Column*/
        /** Use colors '#cb181d' and '#034e7b' for the range */
        this.goalColorScale = null;
        this.sorting ={
            0: 1,
            1: 1,
            2: 1,
            3: 1,
            4: 1,
            5: 1,
        };
    }


    /**
     * Creates a table skeleton including headers that when clicked allow you to sort the table by the chosen attribute.
     * Also calculates aggregate values of goals, wins, losses and total games as a function of country.
     *
     */
    createTable() {

        // ******* TODO: PART II *******
        let that = this;

        //Update Scale Domains

        // Create the axes
        let goalAxis = d3.axisTop().scale(this.goalScale);

        //add GoalAxis to header of col 1.
        let goalAxisTable = d3.select("#goalHeader")
            .append("svg")
            .attr("width", 2*(this.cell.width+this.cell.buffer))
            .attr("height", this.cell.height+this.cell.buffer);
        goalAxisTable.append("g")
            .call(goalAxis)
            .attr("transform", "translate("+this.cell.buffer+" , "+ this.cell.height + ")");

        //this.tableElements = that.teamData;
        //console.log(this.tableElements);
        // ******* TODO: PART V *******

        // Set sorting callback for clicking on headers
        let header = d3.select("#matchTable").select("thead").selectAll("tr").selectAll("th,td");
        header.on("click", (d,i)=>{
            //console.log(i);
            this.collapseList();
            //console.log(this.tableElements);
            this.tableElements = this.tableElements.sort(function (a,b) {
                let result = 0;
                let switchValue = that.sorting[i];
                switch(i) {
                    case 0:
                        if (a.key > b.key) {
                            result = 1*(switchValue);
                        }
                        if (a.key < b.key){
                            result =  -1*(switchValue);
                        }
                        return result;
                        break;
                    case 2:
                        if (a.value.Result.ranking > b.value.Result.ranking){
                            result = -1*(switchValue);
                        }
                        if (a.value.Result.ranking < b.value.Result.ranking){
                            result =  1*(switchValue);
                        }
                        return result;
                        break;
                    case 1:
                    case 3:
                    case 4:
                    case 5:
                        if (a.value[that.tableHeaders[i-1]] > b.value[that.tableHeaders[i-1]]){
                            result = -1*(switchValue);
                        }
                        if (a.value[that.tableHeaders[i-1]]< b.value[that.tableHeaders[i-1]]){
                            result =  1*(switchValue);
                        }
                        return result;
                        break;
            }});
            this.sorting[i] = this.sorting[i]*(-1);
            for (let j = 0; j < 6; j++){
                if (j !== i){
                    this.sorting[j] = 1;
                }
            }
            //console.log(this.sorting.filter(this.sorting.key !== i));
            this.updateTable();

        })

        //Set sorting callback for clicking on Team header
        //Clicking on headers should also trigger collapseList() and updateTable().

    }


    /**
     * Updates the table contents with a row for each element in the global variable tableElements.
     */
    updateTable() {
        // ******* TODO: PART III *******
        //Create table rows
        let that = this;

        let tr = d3.select("#matchTable").select("tbody").selectAll("tr").data(this.tableElements);
        let newTr = tr.enter().append("tr");
        tr.exit().remove();
        tr = tr.merge(newTr);

        tr.attr("id", d=>d.key)
            .on("mouseover", d=>that.tree.updateTree(d))
            .on("mouseleave", d=>this.tree.clearTree())
            .on("click",(d,i)=>this.updateList(d));

        let th = tr.selectAll("th").data(d=>([d]));
        //console.log(th.data());
        th = th.enter().append("th").merge(th);
        th.select("svg").remove();
        th.append("svg")
            .attr("width", this.cell.width)
            .attr("height", this.cell.height);

        th.attr("class", d=>d.value.type)
            .text(d => d.value.type === "game" ? "x"+d.key : d.key);

        let td = tr.selectAll("td").data((d) =>{
            let visData = [
                {"type": d.value.type, "vis": "goals", "value": d.value},
                {"type": d.value.type, "vis": "text",  "value": d.value.Result.label},
                {"type":d.value.type, "vis": "bar", "value":[d.value.Wins]},
                {"type":d.value.type, "vis": "bar", "value":[d.value.Losses]},
                {"type":d.value.type, "vis": "bar", "value":[d.value.TotalGames]}
            ];
            //console.log(visData);
            return visData;
        });

        td = td.enter().append("td").merge(td);
        let goalChart = td.filter((d)=> {
            return d.vis === "goals";
        });
        goalChart.select("svg").remove();

        goalChart.append("svg")
            .attr("height", this.cell.height)
            .attr("width", 2*(this.cell.width+this.cell.buffer));

        goalChart.select("svg").append("g").append("rect")
            .attr("x", d=>this.goalScale(Math.min(d.value[that.goalsMadeHeader], d.value[that.goalsConcededHeader])))
            .attr("y", d=> d.type === "aggregate" ? 4.5 :8)
            .attr("width", d=>this.goalScale(Math.abs(d.value[that.goalsMadeHeader] - d.value[that.goalsConcededHeader])))
            .attr("height", d=> d.type === "aggregate" ? 13 : 6)
            .attr("fill", function(d) {
                if (d.value[that.goalsMadeHeader] > d.value[that.goalsConcededHeader]){
                    return '#034e7b';
                }else{
                    return '#cb181d';
                }
            })
            .attr("class", "goalBar")
            .attr("transform", "translate("+this.cell.buffer+" , 0)");

        goalChart.select("svg").append("g").append("circle")
            .attr("cx", d=>this.goalScale(d.value[that.goalsMadeHeader]))
            .attr("cy", 11)
            .attr("class","goalCircle")
            .attr("stroke", d=> d.value[that.goalsMadeHeader] === d.value[that.goalsConcededHeader] ? 'grey':'#034e7b')
            .attr("fill", function(d){
                if (d.type === "game") {
                    return "white";
                }else{
                    if (d.value[that.goalsMadeHeader] === d.value[that.goalsConcededHeader]){
                        return 'grey';
                    }else{
                        return '#034e7b';
                    }}
            })
            .attr("transform", "translate("+this.cell.buffer+" , 0)");
        goalChart.select("svg").append("g").append("circle")
            .attr("cx", d=>this.goalScale(d.value[that.goalsConcededHeader]))
            .attr("cy", 11)
            .classed("goalCircle", true)
            .attr("stroke", d=> d.value[that.goalsMadeHeader] === d.value[that.goalsConcededHeader] ? 'grey':'#cb181d')
            .attr("fill", function(d){
                if (d.type === "game") {
                    return "white";
                }else{
                    if (d.value[that.goalsMadeHeader] === d.value[that.goalsConcededHeader]){
                        return "grey";
                    }else{
                        return '#cb181d';
                    }}
                })
            .attr("transform", "translate("+this.cell.buffer+" , 0)");

        //goalChart.selectAll("title").remove();
        goalChart.select("svg").append("title").text(d => "Made: " + d.value[this.goalsMadeHeader] + "; Concede: " + d.value[this.goalsConcededHeader]);

        let resultBar = td.filter((d)=> {
            return d.vis === "text";
        });
        resultBar.select("svg").remove();

        resultBar.append("svg")
            .attr("height", this.cell.height)
            .attr("width", this.cell.width*1.8);

        resultBar.select("svg")
            .append("text")
            .attr("x",0)
            .attr("y", 16)
            .text(d =>d.value);

        let gameBar = td.filter((d)=>{
            return d.vis === "bar";
        });
        gameBar.select("svg").remove();
        gameBar.append("svg")
            .attr("height", this.cell.height)
            .attr("width", this.cell.width);
        gameBar.select("svg").append("rect")
            .attr("x", 0)
            .attr("y", 2)
            .attr("width", d=>this.gameScale(d.value))
            .attr("height", 18)
            .attr("fill", d=>this.aggregateColorScale(d.value));
        gameBar.select("svg").append("text")
            .attr("x", d=>this.gameScale(d.value)-9)
            .attr("y", 16)
            .text(d=>d.value)
            .classed("label", true);


        //Append th elements for the Team Names

        //Append td elements for the remaining columns. 
        //Data for each cell is of the type: {'type':<'game' or 'aggregate'>, 'vis' :<'bar', 'goals', or 'text'>, 'value':<[array of 1 or two elements]>}
        
        //Add scores as title property to appear on hover

        //Populate cells (do one type of cell at a time )

        //Create diagrams in the goals column

        //Set the color of all games that tied to light gray

    };

    /**
     * Updates the global tableElements variable, with a row for each row to be rendered in the table.
     *
     */
    updateList(d){
        // ******* TODO: PART IV *******
        //console.log(d);
        //console.log(d.value["games"]);
        if (d.value["type"] === "aggregate"){
            let CountryName= d.key;
            let  gameData = d.value.games;
            //console.log(gameData);
            //console.log(CountryName)
            for (let index =0; index < this.tableElements.length; index ++) {
                if (this.tableElements[index].key === CountryName && this.tableElements[index].value["type"] !== "game"){
                    if ((index+1) < this.tableElements.length && this.tableElements[index+1].value["type"] === "game"){
                        this.tableElements.splice(index+1, gameData.length);
                    }else {
                        this.tableElements.splice(index+1,0, ...gameData);
                    }
                }
            }
            this.updateTable();
        }
    }

    /**
     * Collapses all expanded countries, leaving only rows for aggregate values per country.
     *
     */
    collapseList() {
        this.tableElements = this.teamData.slice();
        this.updateTable();
        // ******* TODO: PART IV *******

    }


}
