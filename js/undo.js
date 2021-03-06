// The Undo Stack consists of ACTIONS.
// You can push an action onto the stack after it has been completed. 
// The stack can then be used to undo or redo certain actions.
// The stack contains all items that have led to the current position in the program.
// The current position of the stack indicates the last item in the stack that can be UNDONE, 
//   all actions following the current position of the stack (if they exist) can only be REDONE.
class UndoStack {
	constructor() {
		this.stack = []
		this.currentPosition = -1;
		this.isStackLocked = false;
	}

	pushAction(action) {
		if (this.isStackLocked) return;
		console.log("Item pushed to undo stack: ", action);
		if (this.currentPosition != this.stack.length - 1) {
			// If an action is performed, it cuts off the current redo path.
			var numberOfItemsThatCanBeRedone = this.stack.length - this.currentPosition - 1;
			this.stack.splice(-numberOfItemsThatCanBeRedone, numberOfItemsThatCanBeRedone)
			this.currentPosition = this.stack.length - 1;
		}
		this.stack.push(action);
		this.currentPosition = this.currentPosition + 1;

		if (this.onUpdate) this.onUpdate();
	}

	/* Sometimes the execution of undoFunctions or redoFunctions generated additional actions that would otherwise
	   be added to the stack. We do not want to consider these actions in our stack, so we ignore them by locking
	   the stack as we execute undoFunctions and redoFunctions */

	undo() {
		var actionToUndo = this.stack[this.currentPosition];
		this.isStackLocked = true;
		actionToUndo.undoFunction();
		this.isStackLocked = false;
		this.currentPosition = this.currentPosition - 1;

		if (this.onUpdate) this.onUpdate();
	}

	redo() {
		var actionToRedo = this.stack[this.currentPosition + 1]
		this.isStackLocked = true;
		actionToRedo.redoFunction()
		this.isStackLocked = false;
		this.currentPosition = this.currentPosition + 1;

		if (this.onUpdate) this.onUpdate();
	}

	// Returns true iff there is an action that can be undone.
	canUndo() {
		return this.currentPosition >= 0;
	}

	// Returns true iff there is an action that can be redone.
	canRedo() {
		return this.currentPosition < (this.stack.length - 1);
	}

	// If there is an action that can be undone, this returns it.
	peekUndo() {
		return this.stack[this.currentPosition];
	}

	// If there is an action that can be reodne, this returns it.
	peekRedo() {
		return this.stack[this.currentPosition + 1]
	}
}

// Represents an action that can be undone and redone, we call these actions "revertable".
// The Undo Stack cannot be modified from within an undoFunction or a redoFunction, these modifications
// will be ignored.
/* All create, update, and delete actions on the model are revertable.
 This includes the following:
 	- Create Reservation
	- Delete Reservation
	- Create Waitlist Entry
	- Delete Waitlist Entry
	- Edit Reservation
	- Edit Waitlist Entry
	- Seat Party
	- Unseat Party
*/

class Action {
	constructor(type, undoFunction, redoFunction) {
		this.type = type;
		this.undoFunction = undoFunction;
		this.redoFunction = redoFunction;
	}
}

function getActionForAddUpcomingList(entry, upcomingList) {
	undoFunction = function() {
		upcomingList.removeEntryWithID(entry.id);
	}

	redoFunction = function() {
		upcomingList.addEntry(entry);
	}

	return new Action("addUpcomingList", undoFunction, redoFunction);
}

function getActionForRemoveUpcomingList(entry, upcomingList) {
	undoFunction = function() {
		upcomingList.addEntry(entry);
	}

	redoFunction = function() {
		upcomingList.removeEntryWithID(entry.id);
	}

	return new Action("removeUpcomingList", undoFunction, redoFunction);
}

function getActionForUpdateUpcomingList(entryBefore, entryAfter, upcomingList) {
	undoFunction = function() {
		upcomingList.updateEntry(entryBefore);
	}

	redoFunction = function() {
		upcomingList.updateEntry(entryAfter);
	}

	return new Action("editUpcomingList", undoFunction, redoFunction);
}

function getActionForPartySeated(table, upcomingList, seatMap) {	
	undoFunction = function() {
		// On undo of a party being seated, put them back in the upcoming list if they're not a
		// walk-in and unassign them from the table.
		if (!table.assignedParty.isWalkIn) {
			upcomingList.addEntry(table.assignedParty);
		}
		table.assignedParty = null;
		seatMap.updateTable(table);
	}

	partyToReassign = table.assignedParty;
	redoFunction = function() {
		// On redo of a party being seated, remove them from the upcoming list if they're not a walk-in
		// and assign them to the table.
		if (!partyToReassign.isWalkIn) {
			upcomingList.removeEntryWithID(partyToReassign.id);
		}
		table.assignedParty = partyToReassign;
		seatMap.updateTable(table);
	}

	return new Action("partySeated", undoFunction, redoFunction);
}

function getActionForPartyUnseated(table, party, upcomingList, seatMap) {
	undoFunction = function() {
		if (!party.isWalkIn) {
			upcomingList.removeEntryWithID(party.id);
		}
		table.assignedParty = party;
		seatMap.updateTable(table);
	}

	redoFunction = function() {
		if (!party.isWalkIn) {
			upcomingList.addEntry(party);
		}
		table.assignedParty = null;
		seatMap.updateTable(table);
	}

	return new Action("partyUnseated", undoFunction, redoFunction);
}
