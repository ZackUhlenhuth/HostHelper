// This class represents the upcoming list.
// Note: this function returns references to the events it tracks.
// This is so that clients can easily modify events.
// But it does open up the possibility for rep. exposure bugs.
// This class should protect its internal list from exposure, however.
class UpcomingList {
	constructor(list, eventListeners) {
		this.list = [];
		this.eventListeners = [];
		setInterval(this.tick, 60 * 1000, this);
	}

	addEntry(entry) {
		this.list.push(entry);
		this.notifyListeners("add", entry);
	}

	removeEntryWithID(entryID) {
		// We'll be nice and translate DOM IDs to our model IDs.
		if (typeof entryID == "string") {
			entryID = entryIDForElementID(entryID);
		}

		var indexToSplice = 0;
		$.each(this.list, function(index, entry){
			if (entry.id == entryID) {
				indexToSplice = index;
			}
		});

		var removedEntry = this.list[indexToSplice];
		this.list.splice(indexToSplice, 1)
		if (removedEntry) {
			this.notifyListeners("remove", removedEntry)
		}
	}

	updateEntry(entry) {
		for (var i = 0; i < this.list.length; i++) {
			if (this.list[i].id == entry.id) {
				this.list[i] = entry;
				this.notifyListeners("update", entry);
			}
		}
	}

	getUpcomingListEntries() {
		return this.list.slice(); // Gaurd against rep. exposure here.
	}

	getEntryWithID(entryID) {
		// We'll be nice and translate DOM IDs to our model IDs.
		if (typeof entryID == "string") {
			entryID = entryIDForElementID(entryID);
		}

		var entryWithID = null;
		$.each(this.list, function(index, entry){
			if (entry.id == entryID) {
				entryWithID = entry;
			}
		});

		return entryWithID;
	}

	/** 
	 * There are currently the following events:
	 *   add, remove, update
	 *
	 * When an event happens, the handler is called with a paramter event.
	 * The event parameter contains the type of the event and the entry effected.
	 */
	registerListener(eventType, handler){
		this.eventListeners.push({eventType: eventType, handler: handler});
	}

	notifyListeners(eventType, entry){
	    localStorage.setItem('upcomingList', JSON.stringify(this.list));
		$.each(this.eventListeners, function(index, eventListener){
			if (eventListener.eventType == eventType) {
				event = {
					eventType: eventType,
					entry: entry,
				}

				eventListener.handler(event);
			}
		});
	}

	tick(upcomingList) {
		// This is just some mock code for our wait prediction algorithm.
		$.each(upcomingList.getUpcomingListEntries(), function(index, entry){
			if (entry.estimatedWaitInMins) {
				if (entry.estimatedWaitInMins > 0){
					entry.estimatedWaitInMins -= 1;
					upcomingList.notifyListeners("update", entry);
				}
			}
			//if Reservation, call update to see if we can draw the entry
			if (entry.time) {
				upcomingList.notifyListeners("update",entry);
			}
		});
	}
}

class UpcomingListEntry {
	constructor(name, size, phone, id, seatedTime, eta) {
		if (id == null) {
			this.id = Math.round(Math.random() * 10000000);
		}
		else {
			this.id = id;
		}
		this.name = name;
		this.partySize = size;
		this.phone = phone;
		
		this.seatedTime = new Date();
  	this.eta = new Date(new Date().getTime() + 30*60000);
	}
}

class WaitlistEntry extends UpcomingListEntry {
	constructor(name, size, phone, estimatedWaitInMins, id){
		super(name, size, phone, id)
		this.estimatedWaitInMins = estimatedWaitInMins;
		
	}

	getCountdownString() {
	  var minuteSuffix;
	  if (this.estimatedWaitInMins == 1)
	    minuteSuffix = " min";
	  else
	    minuteSuffix = " mins";
	  
		return "<span class='glyphicon glyphicon-hourglass'></span> " + this.estimatedWaitInMins + minuteSuffix;
	}

}

class Reservation extends UpcomingListEntry {
	constructor(name, size, phoneNumber, time, id) {
		super(name, size, phoneNumber, id)
		this.time = time;
	}

	getCountdownString() {
		var hours = "";
		var AMPM = "AM"
		if (this.time.getHours() > 11) {
			hours += (this.time.getHours() - 12);
			AMPM = "PM";
		} else {
			hours += (this.time.getHours());
		}

		var minutes = "" + this.time.getMinutes();
		if (minutes.length < 2){
			minutes = "0" + minutes;
		}

		return "<span class='glyphicon glyphicon-calendar'></span> " + hours + ":" + minutes + " " + AMPM
	}
}

function entryIDForElementID(elementID) {
	return parseInt(elementID.substring("party".length));
}
