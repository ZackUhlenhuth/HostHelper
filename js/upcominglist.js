class UpcomingList {
	constructor() {
		this.list = []
	}

	addEntry(entry) {
		this.list.push(entry);
	}

}

class UpcomingListEntry {
	constructor(name, size, phoneNumber) {
		this.name = name;
		this.partySize = size;
		this.phoneNumber = phoneNumber;
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