// This class represents the upcoming list.
// Note: this function returns references to the events it tracks.
// This is so that clients can easily modify events.
// But it does open up the possibility for rep. exposure bugs.
// This class should protect its internal list from exposure, however.
class UpcomingList {
	constructor() {
		this.list = []
		this.eventListeners = [];
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
	 *   add, remove
	 *
	 * When an event happens, the handler is called with a paramter event.
	 * The event parameter contains the type of the event and the entry effected.
	 */
	registerListener(eventType, handler){
		this.eventListeners.push({eventType: eventType, handler: handler});
	}

	notifyListeners(eventType, entry){
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
}

class UpcomingListEntry {
	constructor(name, size, phone) {
		this.id = Math.round(Math.random() * 10000000);
		this.name = name;
		this.partySize = size;
		this.phone = phone;
	}
}

class WaitlistEntry extends UpcomingListEntry {

}

class Reservation extends UpcomingListEntry {
	constructor(name, size, phoneNumber, time) {
		super(name, size, phoneNumber)
		this.time = time;
	}
}

function entryIDForElementID(elementID) {
	return parseInt(elementID.substring("party".length));
}