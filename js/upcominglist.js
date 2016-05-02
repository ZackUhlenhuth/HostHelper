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
		this.sort();
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
		this.sort();
		if (removedEntry) {
			this.notifyListeners("remove", removedEntry)
		}
	}

	/* We sort upcoming list entries by "urgency", which we define as follows:
		The upcoming list entry with the SMALLEST amount of time remaining until it needs seated is
		seated first.

		The time to seat of a waitlist entry is the estimated wait time of that waitlist entry.

		The time to seat of a reservation is ten minutes less than the amount of time between
		now and the time associated with that reservation.

		Reservations are given the additional ten minute advantage as they are more urgent to seat at a
		given time than a waitlist entry.
	*/
	sort() {
		this.list.sort(function(reservationEntryA, reservationEntryB){
			return reservationEntryA.getTimeUntilHostShouldSeat() - reservationEntryB.getTimeUntilHostShouldSeat();
		});

		$.each(this.list, function(index, element){
			element.position = index;
		});
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
	
	getNextReservationTime() {
	  var times = [];
	  for (var i = 0; i < this.list.length; i++) {
	    if (isNaN(this.list[i].estimatedWaitInMins)) {
	      times.push(this.list[i].time);
	    }
	  }
	  var next = times[0];
	  for (var i = 1; i < times.length; ++i) {
	    if (next > times[i])
	      next = times[i];
	  }
	  return (next - new Date());
	  
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

	// Normally this would be done with some sort of backend algorith, however
	// backends are beyond the scope of this course, so this function just fakes it.
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
	constructor(name, size, phone, id, seatedTime) {
		if (id == null) {
			this.id = Math.round(Math.random() * 10000000);
		} else {
			this.id = id;
		}

		this.name = name;
		this.partySize = size;
		this.phone = phone;
		
		if (seatedTime == null) {
		  this.seatedTime = new Date();
		} else {
		  this.seatedTime = seatedTime;
		}

		// This will be defined after the upcomingList is sorted.
		this.position = null;
	}

	// Returns number of miliseconds remaining until party is estimated to finish eating.
	// We estimate all parties take 30 minutes to eat after they are seated. 
	getEstimatedTimeUntilPartyFinishes() {
		var THIRTY_MINUTES_IN_MILISECONDS = 30*60*1000;
		return this.seatedTime.getTime() + THIRTY_MINUTES_IN_MILISECONDS - Date.now();
	}
}

class WaitlistEntry extends UpcomingListEntry {
	constructor(name, size, phone, estimatedWaitInMins, id, types){
		super(name, size, phone, id)
		this.estimatedWaitInMins = estimatedWaitInMins;
		this.types = types;
	}

	getCountdownString() {
	  var minuteSuffix;
	  if (this.estimatedWaitInMins == 1){
	    minuteSuffix = " min";
	  } else {
	    minuteSuffix = " mins";
	 }
	  
		return "<span class='glyphicon glyphicon-hourglass'></span> " + this.estimatedWaitInMins + minuteSuffix;
	}

	// Returns the number of miliseconds until the host should seat this party.
	getTimeUntilHostShouldSeat() {
		var MILISECONDS_IN_MINUTE = 1*60*1000;
		return this.estimatedWaitInMins * MILISECONDS_IN_MINUTE;
	}
}

class Reservation extends UpcomingListEntry {
	constructor(name, size, phoneNumber, time, id, types) {
		super(name, size, phoneNumber, id)
		this.time = time;
		this.types = types;
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

	// Gets the number of miliseconds until a host should seat this reservations.
	// Reservations should be seated ten minutes before their reservation time.
	getTimeUntilHostShouldSeat() {
		var TEN_MINUTES_MILISECONDS = 10*60*1000;
		return this.time.getTime() - Date.now() - TEN_MINUTES_MILISECONDS;
	}
}

function entryIDForElementID(elementID) {
	return parseInt(elementID.substring("party".length));
}
