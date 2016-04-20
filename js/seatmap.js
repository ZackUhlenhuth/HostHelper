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
		this.updateWaiterZone(this.getWaiterZone(table));
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

	// This will ignore any filters specified as null arguments.
	// If both arguments are null, it will return an empty list.
	getOpenTablesMatchingFilters(partySize, server) {
		if (partySize == null && server == null) return [];

		var tableSizeFilter = function(thisTable) {
    		return partySize <= thisTable.capacity || partySize == null;
    	}

    	var serverFilter = function(thisTable) {
    		return server == thisTable.waiterZone.waiterName || server == null;
    	}

		return this.getOpenTables().filter(tableSizeFilter).filter(serverFilter);
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
		var count = 0;
		for (var i = 0; i < this.tables.length; i++) {
			var currTable = this.tables[i];
			//check if table's x and y is within waiter zone boundaries
			if (currTable.x >= waiterX1 && currTable.x <= waiterX2 && currTable.y >= waiterY1 && currTable.y <= waiterY2) {
				count++;
			}
		}
		return count;
	}

	getOccupiedWaiterZoneTables(waiterZone) {
		var waiterX1 = waiterZone.x;
		var waiterY1 = waiterZone.y;
		var waiterX2 = waiterZone.x + waiterZone.width;
		var waiterY2 = waiterZone.y + waiterZone.height;
		var count = 0;
		for (var i = 0; i < this.tables.length; i++) {
			var currTable = this.tables[i];
			//check if table's x and y is within waiter zone boundaries
			if (currTable.x >= waiterX1 && currTable.x <= waiterX2 && currTable.y >= waiterY1 && currTable.y <= waiterY2) {
				if (currTable.isOccupied()) {
					count++;
				}
			}
		}
		return count;
	}

	getWaiterZone(table) {
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
	constructor(id, capacity, x, y, style, orientation) {
		this.id = id;

		this.capacity = capacity;
		this.x = x;
		this.y = y;
		this.style = style;
		this.orientation = orientation;
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
