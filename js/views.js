// Citation: http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element
function makeSVG(tag, attrs) {
  var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (var k in attrs)
    e.setAttribute(k, attrs[k]);
  return e;
}

function makeUpcomingListString(entry) {
  return entry.name + " (" + entry.partySize + ")<span class='countdown-string'>" + entry.getCountdownString() + "</span>";
}

function getViewForTable(table) {
  return $("#table" + table.id);
}

function getLabelCoords(tableView, table) {
  if (table.style == "rect") {
    width = parseInt(tableView.attr("width"), 10);
    return {x: table.x + (width / 2.0), y: table.y};
  } else if (table.style == "ellipse") {
    radius = parseInt(tableView.attr("rx"), 10);
    return {x: table.x, y: table.y - radius}
  }
}

function drawTableIDLabel(tableView, table) {
  labelCoords = getLabelCoords(tableView, table);

  hashtagIcon = "&#xf292";
  tableLabel = makeSVG('text', {id: "table" + table.id + 'Label',
							                  class: 'infoLabel',
								                x: labelCoords['x'] - 10,
 								                y: labelCoords['y'] + 20});

 	tableLabel.innerHTML = hashtagIcon + " " + table.id;
 	return tableLabel;
}

function drawTableCapacityLabel(tableView, table) {
  labelCoords = getLabelCoords(tableView, table);

	capacityIcon = "&#xf0c0";
  capacityLabel = makeSVG('text', {id: "table" + table.id + 'Capacity',
   								   class: 'infoLabel',
   								   'table-capacity': table.capacity,
    								  x: labelCoords['x'] - 20,
    								  y: labelCoords['y'] + 60});

  capacityLabel.innerHTML = capacityIcon + " 0 / " + table.capacity;
  return capacityLabel;
}

function drawPartyLabel(tableView, table) {
    labelCoords = getLabelCoords(tableView, table);
    var partyLabel = makeSVG('text', {id: 'table' + table.id + 'PartyLabel', class: "partyLabel", x: labelCoords['x'] - 20, y: labelCoords['y'] + 40});
    partyLabel.innerHTML = table.assignedParty.name;
    return partyLabel;
}

function drawTableView(table) {
	svgAttributes = {class: "restaurantTable"};
	svgAttributes["id"]  = "table" + table.id;

	if (table.style == "rect") {
		svgAttributes["x"] = table.x;
		svgAttributes["y"] = table.y;
		if (table.orientation == "horizontal") {
		  svgAttributes["width"] = table.capacity * 25;
		  svgAttributes["height"] = 70;
		}
		else {
		  svgAttributes["width"] = 70;
		  svgAttributes["height"] = table.capacity * 25;
	  }
		svgAttributes["rx"] = 10;
		svgAttributes["ry"] = 10;
	} else if (table.style == "ellipse") {
		svgAttributes["cx"] = table.x;
		svgAttributes["cy"] = table.y;
		svgAttributes["rx"] = Math.sqrt(table.capacity/1.5) * 30;
		svgAttributes["ry"] = Math.sqrt(table.capacity/1.5) * 30;
	}

	tableView = $(makeSVG(table.style, svgAttributes));
	return tableView;
}

function drawWaiterZone(waiterZone) {
  svgAttributes = {class: "waiterZone"};
  svgAttributes["id"] = "waiterZone" + waiterZone.id;

  svgAttributes["rx"] = 10;
  svgAttributes["ry"] = 10;

  svgAttributes["height"] = waiterZone.height;
  svgAttributes["width"] = waiterZone.width;
  svgAttributes["x"] = waiterZone.x;
  svgAttributes["y"] = waiterZone.y;

  waiterZoneView = $(makeSVG("rect", svgAttributes))
  waiterZoneView.css("stroke", waiterZone.color);

  return waiterZoneView;
}

function drawWaiterZoneLabel(waiterZone, seatMap) {
  var xCoord = waiterZone.x + 10; //hardcoded
  var yCoord = waiterZone.y - 4;
  var labelColor = waiterZone.color;
  var waiterLabel = makeSVG('text', {id: waiterZone.id + 'Waiter', fill: labelColor, 'font-size': '14', 'font-family': 'Verdana', x: xCoord, y: yCoord});
  waiterLabel.innerHTML = waiterZone.waiterName + " " + seatMap.getOccupiedWaiterZoneTables(waiterZone) + "/" + seatMap.getWaiterZoneTables(waiterZone);

  return waiterLabel;
}

function drawUpcomingListEntry(entry) {
      var editButtons = $("<span class='pull-right'>" + 
                  "<button class='btn btn-xs btn-warning edit-upcoming-party'><span class='glyphicon glyphicon-pencil'></span></button>" +
                  "<button class='btn btn-xs btn-danger remove-upcoming-party'><span class='glyphicon glyphicon-remove'></span></button>" +
                  "</span>");

    newEntry = $("<a href='#' class='list-group-item clearfix upcoming-party'></a>");
    newEntry.attr('party-name', entry.name);
    newEntry.attr('party-size', entry.partySize);
    newEntry.attr('party-phone', entry.phone);
    newEntry.attr('id', 'party' + entry.id);
    newEntry.html(makeUpcomingListString(entry));
    newEntry.prepend(editButtons);

    return newEntry;
}

function drawPartyOption(entry) {
    partyOption = $('<option></option>');
    partyOption.attr("id", "party" + entry.id);
    partyOption.attr("value", "party" + entry.id);
    partyOption.html(entry.name);

    return partyOption;
}
