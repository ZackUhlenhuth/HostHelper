// Defines the model for the seat map. Does not include enviroment (walls, etc.)
class SeatMap {
	constructor() {
		this.tables = [];
		this.waiterZones = [];
		this.eventListeners = [];
	}

	// this.tables should not be modified directly, it should be modified only
	// through these helper functions.
	addTable(table) {
		this.tables.push(table);
		this.notifyListeners("addTable", table);
	}

	updateTable(table) {
		for (var i = 0; i < this.tables.length; i++) {
			if (this.tables[i].id == table.id) {
				this.tables[i] = table;
				this.notifyListeners("updateTable", table);
			}
		}

		// We'll update the waiterZone for every table update for now.
		this.updateWaiterZone(this.getWaiterZoneByTable(table));
	}

	getTableWithID(tableID) {
		// We'll be nice and accept DOM IDs too.
		if (typeof tableID == "string") tableID = tableIDForElementID(tableID);

		for (var i = 0; i < this.tables.length; i++) {
			if (this.tables[i].id == tableID) {
				return this.tables[i];
			}
		}
	}

	getTables() {
		return this.tables;
	}

	getOpenTables() {
		return this.tables.filter(function(thisTable){
			return !thisTable.isOccupied();
		});
	}
	
	getTimeUntilNextTable() {
	  var times = [];
	  for (var i = 0; i < this.tables.length; i++) {
	    if (this.tables[i].assignedParty != null)
	      times.push(new Date(this.tables[i].assignedParty.eta));
	    else
	      times.push(new Date());
	  }
	  return (times.sort()[1] - new Date());
	}

	//return waiterZone given table
	getWaiterZoneByTable(table) {
		for (var i = 0; i < this.waiterZones.length; i++) {
			var currZone = this.waiterZones[i];
			var zoneX1 = currZone.x;
			var zoneY1 = currZone.y;
			var zoneX2 = currZone.x + currZone.width;
			var zoneY2 = currZone.y + currZone.height;
			if (table.x >= zoneX1 && table.x <= zoneX2 && table.y >= zoneY1 && table.y <= zoneY2) {
				return currZone;
			}
		}
	}

	getWaiterZoneByName(waiterName) {
		return this.waiterZones.filter(function(thisZone){
			return thisZone.waiterName == waiterName;
		})[0];
	}

	getWaiterZonesLowestUsage() {
	  var zones = this.waiterZones;
	  var sm = this;
	  zones.sort(function(a,b){
	    return sm.getOccupiedWaiterZoneTables(a).length > sm.getOccupiedWaiterZoneTables(b).length;
	  });
	  var stop = zones.length;
	  for (var i = 1; i < zones.length; ++i) {
	    if (sm.getOccupiedWaiterZoneTables(zones[i]).length > sm.getOccupiedWaiterZoneTables(zones[i-1]).length)
	      stop = i;
	  }
	  return zones.slice(0,stop);
	}
	
	getTableBestFit(partySize) {
	  var possibleZones = this.getWaiterZonesLowestUsage();
	  for (var i = 0; i < 10; i++) {
	    for (var j = 0; j < possibleZones.length; ++j) {
	      var tableSizeFilter = function(thisTable) {
      		return partySize+i == thisTable.capacity || partySize == null;
        }
	      var possibleTables = this.getOpenWaiterZoneTables(possibleZones[j]).filter(tableSizeFilter);
	      if (possibleTables.length > 0)
	        return possibleTables[0];
	    }
	  }
	  return null;
	}

	// This will ignore any filters specified as null arguments.
	// If both arguments are null, it will return an empty list.
	getOpenTablesMatchingFilters(partySize, server, type) {
		if (partySize == null && server == null && type == null) return [];

		var waiterZone = this.getWaiterZoneByName(server);

		var tableSizeFilter = function(thisTable) {
    		return partySize <= thisTable.capacity || partySize == null;
    }

    if (server == null) {
      if (type == null)
    	  return this.getOpenTables().filter(tableSizeFilter);
    	else {
    	  return this.getOpenTables().filter(tableSizeFilter).filter(function(index){
    	    return isSubArray(type, index.types);
    	  });
    	}
    } else {
      if (type == null)
    	  return this.getOpenWaiterZoneTables(waiterZone).filter(tableSizeFilter);
    	else {
    	  return this.getOpenWaiterZoneTables(waiterZone).filter(tableSizeFilter).filter(function(index){
    	    return isSubArray(type, index.types);
    	  });
    	}
    }
	}

	// this.waiterZones should not be modified directly, it should only be modified
	// through these helper functions.
	addWaiterZone(waiterZone) {
		this.waiterZones.push(waiterZone);
		this.notifyListeners("addWaiterZone", waiterZone);
	}

	updateWaiterZone(waiterZone) {
		for (var i = 0; i < this.waiterZones.length; i++) {
			if (this.waiterZones[i].id == waiterZone.id) {
				this.waiterZones[i] = waiterZone;
				this.notifyListeners("updateWaiterZone", waiterZone);
			}
		}
	}

	getWaiterZoneTables(waiterZone) {
		var waiterX1 = waiterZone.x;
		var waiterY1 = waiterZone.y;
		var waiterX2 = waiterZone.x + waiterZone.width;
		var waiterY2 = waiterZone.y + waiterZone.height;

		return this.tables.filter(function(currTable){
			return (currTable.x >= waiterX1 && currTable.x <= waiterX2 && currTable.y >= waiterY1 && currTable.y <= waiterY2);
		});
	}

	getOccupiedWaiterZoneTables(waiterZone) {
		return this.getWaiterZoneTables(waiterZone).filter(function(currTable){
			return currTable.isOccupied();
		});
	}

	getOpenWaiterZoneTables(waiterZone) {
		return this.getWaiterZoneTables(waiterZone).filter(function(currTable){
			return !currTable.isOccupied();
		});
	}

	/** 
	 * There are currently the following events:
	 *   addTable, updateTable, addWaiterZone, updateWaiterZone
	 *
	 * When an event happens, the handler is called with a paramter event.
	 * The event parameter contains the type of the event and the entry effected.
	 */
	registerListener(eventType, handler){
		this.eventListeners.push({eventType: eventType, handler: handler});
	}

	notifyListeners(eventType, table){
		localStorage.setItem('seatmapTables', JSON.stringify(this.tables));
		$.each(this.eventListeners, function(index, eventListener){
			if (eventListener.eventType == eventType) {
				event = {
					eventType: eventType,
					item: table,
				}

				eventListener.handler(event);
			}
		});
	}
}

class Table {
	// Valid styles: ellipse, rect
	constructor(id, capacity, x, y, style, orientation, types) {
		this.id = id;

		this.capacity = capacity;
		this.x = x;
		this.y = y;
		this.style = style;
		this.orientation = orientation;
		this.types = types;
		this.assignedParty = null;
	}

	isOccupied() {
		return this.assignedParty != null;
	}

	canPartyFit(party) {
		return party.partySize <= this.capacity;
	}
}

class WaiterZone {
	constructor(waiterName, height, width, x, y, color) {
		this.id = Math.round(Math.random() * 10000000);

		this.waiterName = waiterName;
		this.height = height;
		this.width = width;
		this.x = x;
		this.y = y;
		this.color = color;

		this.tables = [];
	}

	addTable(table) {
		this.tables.push(table);
	}
}

function tableIDForElementID(elementID) {
	return parseInt(elementID.substring("table".length));
}

// check if an array is contained in another array
// function courtesy of Grainier Perera, 
// http://grainier.net/how-to-check-sub-array-in-javascript/
function isSubArray (subArray, array) {
    for(var i = 0 , len = subArray.length; i < len; i++) {
        if($.inArray(subArray[i], array) == -1) return false;
    }
    return true;
}

