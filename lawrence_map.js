// Global variables
var width,
	height,
	map,
	projection,
	path;

function init() {
	setMap();
	loadData();
}

function setMap() {
	// Set width and height of map
	width = document.getElementById("mapid").clientWidth;
	height = window.innerHeight;

	// Create SVG object that contains map
    map = d3.select("#mapid")
			.append( "svg" )
			.attr( "width", width)
			.attr( "height", height);
			//.append("g");
}

function loadData() {
	d3.queue()
	.defer(d3.json, "data/roads_topo.json")
	.defer(d3.json, "data/lawrence_all_tracts.json")
	.await(processData);
}

function processData(error, roadsFile, tracts) {
	if (error) throw error;
	else {
		// roadsFile: topojson with roads data
		drawMap(roadsFile, tracts);
	}
}

function drawMap(roadsFile, tracts) {
	map.append("image")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height)
		.attr("xlink:href", "assets/lawrence_census_map.png");

	// Turn lat/lon coordinates into screen coordinates
	// Question: mercator projection seems more accurate, but what are benefits of albers projection?
	//projection = d3.geoMercator().fitSize([width, height], topojson.mesh(roadsFile, roadsFile.objects.roads));
	projection = d3.geoAlbers().fitSize([width, height], tracts);
	path = d3.geoPath().projection(projection);

	
	// Draw roads on map
    //var roads = map.append("g");
	//roads.append("path")
	/*map.append("path")
		.datum(topojson.mesh(roadsFile, roadsFile.objects.roads))
		.attr("class", "road")
		.attr("d", path)
		.attr("fill", "transparent")
		.attr("stroke", "black")
		.attr("stroke-width", 0.5)
		.attr("stroke-opacity", 0.3);*/

	var census_tracts = map.append("g");
	census_tracts.append("path")
		.datum(tracts.features)
		.enter()
		.attr("d", path)
		.attr("class", "tract")
		.attr("fill", "red");
}

window.onload = init();