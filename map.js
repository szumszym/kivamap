queue()
    .defer(d3.xml, "map.svg", "image/svg+xml")
    .await(ready);

function ready(error, xml) {

    //Adding our svg file to HTML document
    var importedNode = document.importNode(xml.documentElement, true);
    d3.select("#map").node().appendChild(importedNode);

    var svg = d3.select("svg");
var currentSpot = $('')
    var path = svg.select("path[id^=path][data-current=true]"),
        startPoint = pathStartPoint(path);

    var checkbox = d3.selectAll("input[name=visibility]");

    checkbox.on("change", function() {
        if (this.checked) {
            path.style("visibility", "visible");
            this.value = "visible";
        } else {
            path.style("visibility", "hidden");
            this.value = "hidden";
        };
    });

    var marker = svg.append("image")
        .attr("xlink:href", "vehicle.png")
        .attr("transform", "translate(" + startPoint[0] + "," + startPoint[1] + ")")
        .attr("width", 48)
        .attr("height", 24);

    transition();

    //Get path start point for placing marker
    function pathStartPoint(path) {
        var d = path.attr("d"),
            dsplitted = d.split(" ");
        return dsplitted[0].replace('m', '').replace('M', '').split(",");
    }

    function transition() {
        marker.transition()
            .duration(17000)
            .attrTween("transform", translateAlong(path.node()));
            //.each("end", transition);// infinite loop
    }

    function translateAlong(path) {
        var l = path.getTotalLength();
        var t0 = 0;
        return function(i) {
            return function(t) {
                var p0 = path.getPointAtLength(t0 * l);//previous point
                var p = path.getPointAtLength(t * l);////current point
                var angle = Math.atan2(p.y - p0.y, p.x - p0.x) * 180 / Math.PI;//angle for tangent
                t0 = t;
                //Shifting center to center of rocket
                var centerX = p.x - 24,
                    centerY = p.y - 12;
                return "translate(" + centerX + "," + centerY + ")rotate(" + angle + " 24" + " 12" +")";
            }
        }
    }
}