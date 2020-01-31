/** Class implementing the tree view. */
class Tree {
    /**
     * Creates a Tree Object
     */
    constructor() {
        
    }

    /**
     * Creates a node/edge structure and renders a tree layout based on the input data
     *
     * @param treeData an array of objects that contain parent/child information.
     */
    createTree(treeData) {

        // ******* TODO: PART VI *******

        //Create a tree and give it a size() of 800 by 300. 
        let treemap = d3.tree().size([800, 300]);

        //Create a root for the tree using d3.stratify(); 
        let root =d3.stratify()
            .id((d,i)=>i)
            .parentId(d => d.ParentGame)
            (treeData);
        //console.log(root);

        let trData = treemap(root);
        let nodes = trData.descendants(),
            links = trData.descendants().slice(1);
        //console.log(nodes);
        //console.log(links);
        //Add nodes and links to the tree.
        let node = d3.select("#tree")
            .attr("transform", "translate("+80+","+20+")")
            .selectAll(".node").data(nodes,d=>d.id || (d.id = ++i));

        let nodeEnter = node.enter().append("g")
            .attr("transform", function (d) {
                return "translate(" +d.y+ "," + d.x + ")";
            });

        nodeEnter.append("circle")
            .attr("r", 5)
            .style("fill", d => d.data.Wins === "1" ? "#364e74": "#be2714");

        nodeEnter.append("text")
            .attr("dy", ".35em")
            .attr("x", d => d.children || d._children ? -12 : 12)
            .attr("text-anchor", d => d.children || d._children ? "end" : "start")
            .attr("class", "node text")
            .text(d => d.data.Team);

        let link = d3.select("#tree").selectAll("path.link")
            .data(links, d => d.id);
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", d=> diagonal(d,d.parent));

        function diagonal(c,p) {
         let path =  `M ${c.y} ${c.x} 
                C ${(c.y + p.y) / 2} ${c.x},
                ${(c.y + p.y) / 2} ${p.x},
                ${p.y} ${p.x}`;
         return path;
        }
    }

    /**
     * Updates the highlighting in the tree based on the selected team.
     * Highlights the appropriate team nodes and labels.
     *
     * @param row a string specifying which team was selected in the table.
     */
    updateTree(row){
        // ******* TODO: PART VII *******
        //console.log(row);
        let countryName = row.key;
        let opponentName = row.value.Opponent;
        if (row.value.type === "aggregate"){
            d3.select("#tree").selectAll("path.link").filter(d=>d.data.Team === countryName && d.parent.data.Team === countryName)
                .attr("class", "selected");
            d3.select("#tree").selectAll("text").filter(d=>d.data.Team === countryName)
                .attr("class", "selectedLabel");
        }
        if (row.value.type ==="game" && row.value.Result.ranking > 0){
            d3.select("#tree").selectAll("path.link").filter(d => d.data.Team === countryName && d.data.Opponent === opponentName)
                .attr("class", "selected");
            d3.select("#tree").selectAll("path.link").filter(d => d.data.Team === opponentName && d.data.Opponent === countryName)
                .attr("class", "selected");
            d3.select("#tree").selectAll("text").filter(d => d.data.Team === countryName && d.data.Opponent === opponentName)
                .attr("class", "selectedLabel");
            d3.select("#tree").selectAll("text").filter(d => d.data.Team === opponentName && d.data.Opponent === countryName)
                .attr("class", "selectedLabel");
        }
    }

    /**
     * Removes all highlighting from the tree.
     */
    clearTree() {
        // ******* TODO: PART VII *******
        d3.select("#tree").selectAll("path.selected")
            .attr("class", "link");
        d3.select("#tree").selectAll("text")
            .attr("class","node text")
        // You only need two lines of code for this! No loops! 
    }
}
