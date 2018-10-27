queue()
    .defer(d3.xml, "map.svg", "image/svg+xml")
    .await(ready);

function ready(error, xml) {

    //Adding our svg file to HTML document
    var importedNode = document.importNode(xml.documentElement, true);
    d3.select("#map").node().appendChild(importedNode);

    var svg = d3.select("svg");

    var visitedPaths = svg.selectAll("path[id^=path][data-visited=true]");
    var firstPath = svg.select("path[id^=path][data-current=true]");
    var startPoint = pathStartPoint(firstPath);

    var vehicle = svg.append("image")
        .attr("xlink:href", "vehicle.png")
        .attr("transform", "translate(" + startPoint[0] + "," + startPoint[1] + ")")
        .attr("width", 60)
        .attr("height", 30);

    function animateVehicleAlongVisitedPaths(paths) {
        var i = 0;
        step(paths);

        function step(paths) {
            if (i >= paths.length) return;
            transition(paths[i++], 1700, function () {
                return zoomInAndOut(1.2, 750, function () {
                    step(paths);
                });
            });
        }
    }

    animateVehicleAlongVisitedPaths(visitedPaths[0]);

    //Get path start point for placing vehicle
    function pathStartPoint(path) {
        var d = path.attr("d"),
            dsplitted = d.split(" ");
        let posX = dsplitted[0].replace('m', '').replace('M', '');
        let posY = dsplitted[1].replace(/C.*/, "");
        return [posX, posY];
    }

    function zoomInAndOut(scale, duration, callbackFn) {
        let dd = vehicle.attr("transform");
        return vehicle.transition()
            .duration(duration)
            .attr("transform", dd + "scale(" + scale + "," + scale + ")")
            .each("end", function () {
                let dd = vehicle.attr("transform").replace(/scale\(.*\)/, "scale(1,1)");
                let attr = vehicle.transition()
                    .duration(duration)
                    .attr("transform", dd);

                return attr.each("end", callbackFn ? callbackFn : function () {
                });
            });
    }

    function transition(path, duration, callbackFn) {
        return vehicle.transition()
            .duration(duration)
            .attrTween("transform", translateAlong(path)).each("end", callbackFn ? callbackFn : function () {
            });
    }

    function translateAlong(path) {
        var l = path.getTotalLength();
        var t0 = 0;
        return function (i) {
            return function (t) {
                var p0 = path.getPointAtLength(t0 * l);//previous point
                var p = path.getPointAtLength(t * l);////current point
                var angle = Math.atan2(p.y - p0.y, p.x - p0.x) * 180 / Math.PI;//angle for tangent
                t0 = t;
                //Shifting center to center of rocket
                var centerX = p.x - 24,
                    centerY = p.y - 12;
                return "translate(" + centerX + "," + centerY + ")rotate(" + angle + " 24" + " 12" + ")";
            }
        }
    }
}