// This class represents the upcoming list.
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

	/** 
	 * There are currently the following events:
	 *   add
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