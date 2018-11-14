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
	.defer(d3.csv, "data/lawrence_supermarkets.csv")
	.defer(d3.json, "data/lawrence_selected_tracts_topo.json")
	.await(processData);
}

function processData(error, roadsFile, stores, tracts) {
	if (error) throw error;
	else {
		// roadsFile: topojson with roads data
		drawMap(roadsFile, stores, tracts);
	}
}

function drawMap(roadsFile, stores, tracts) {
	map.append("image")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height)
		.attr("xlink:href", "assets/rice_plate.png");

	map.append("image")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height)
		.attr("xlink:href", "assets/lawrence_food_access_map.png");

	// Turn lat/lon coordinates into screen coordinates
	// Question: mercator projection seems more accurate, but what are benefits of albers projection?
	projection = d3.geoMercator().fitSize([width, height], topojson.mesh(roadsFile, roadsFile.objects.roads));
	//projection = d3.geoMercator().fitSize([width, height], topojson.mesh(tracts, tracts.objects.lawrence_selected_tracts));
	path = d3.geoPath().projection(projection);

	
	// Draw roads on map
    //var roads = map.append("g");
	//roads.append("path")
	map.append("path")
		.datum(topojson.mesh(roadsFile, roadsFile.objects.roads))
		.attr("class", "road")
		.attr("d", path)
		.attr("fill", "transparent")
		.attr("stroke", "black")
		.attr("stroke-width", 0.5)
		.attr("stroke-opacity", 0.3);

	var census_tracts = map.append("g");
	census_tracts.append("path")
		.datum(topojson.mesh(tracts, tracts.objects.lawrence_selected_tracts))
		.enter()
		.attr("d", path)
		.attr("class", "tract")
		.attr("fill", "red");
	
	addStores(stores);
}

function addStores (stores) {

	// Add pins for stores
	var points = map.append("g");
	points.selectAll("g.marker")
		.data(stores)
		.enter()
		.append("image")
		.attr("x", function(d) {return projection([Number(d.longitude), Number(d.latitude)])[0];})
		.attr("y", function(d) {return projection([Number(d.longitude), Number(d.latitude)])[1];})
		.attr("xlink:href", "assets/cilantro_small.png")
		.attr("opacity", 1.0)
		.on("mouseover", function () {
			if (d3.select(this).attr('opacity') == 1.0) {
				d3.select(this).attr('opacity', 0.5);
			}
		})
		.on("mouseout", function () {
			if (d3.select(this).attr('opacity') == 0.5) {
				d3.select(this).attr('opacity', 1.0);
			}
		})
		.on("click", function(d) {
			d3.selectAll("g.marker").attr('opacity', 1.0);
			d3.select(this).attr('opacity', 0.5);
			d3.select("#info1")
				.text(d.store_name);
			d3.select("#info2")
				.text(d.address);
			d3.select("#info3")
				.text("SNAP and WIC");
		});
}

window.onload = init();