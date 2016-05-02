// Modified from "Cut & Paste Live Clock using forms" by George Chiang,
// http://javascriptkit.com/script/cut2.shtml
function get12hour(ds){
  d = new Date(ds);
  var hours= d.getHours();
  var minutes= d.getMinutes();
  var dn="AM";
  
  if (hours>11) {
    dn="PM";
    hours=hours-12;
  }
  if (hours == 0) hours=12;
  if (minutes<=9) minutes="0"+minutes;
  if (hours<=9 == 1) hours="0"+hours;
  return hours + ":" + minutes + " " + dn;
}

function refreshClock(){
  $("#clock").html(get12hour(new Date()));
}
refreshClock();
setInterval("refreshClock()",1000);

function isLater(time1, time2){
  hour1 = parseInt(time1.substring(0,2));
  minutes1 = parseInt(time1.substring(3,5));
  hour2 = parseInt(time2.substring(0,2));
  minutes2 = parseInt(time2.substring(3,5));
  if (time1.match(/PM$/)){
    if (time2.match(/AM$/)){
      return true;
    }else{
      if (hour1 < hour2){
        return false;
      }else if (hour1 > hour2){
        return true;
      }else{
        if (minutes1 > minutes2){
          return true;
        }else{
          return false;
        }
      }
    }
  }else{
    if (time2.match(/PM$/)){
      return false;
    }else{
      if (hour1 < hour2){
        return false;
      }else if (hour1 > hour2){
        return true;
      }else{
        if (minutes1 > minutes2){
          return true;
        }else{
          return false;
        }
      }     
    }
  }
}


//does date1 occur on or after date2
function validDate(date1, time1, date2){
  if (date1.getFullYear() > date2.getFullYear()){
    return true;
  }
  else if (date1.getFullYear() == date2.getFullYear()){
    if (date1.getDate() < date2.getDate()){
      return false;
    }else if (date1.getMonth() > date2.getMonth()){
      return true;
    }else if (date1.getMonth() == date2.getMonth()){
      if (date1.getDate() > date2.getDate()){
        return true;
      }else if (date1.getDate() == date2.getDate()){
        return (isLater(time1,get12hour(date2)));
      }
    }
  }
}
  

// Inputs are jquery references in the form "#abcd"
// Party Name should be truncated to 12 characters before validUpcomingEntry is run
function validUpcomingEntry(form, name, size, phone, time="none", date="none"){
    var RESTAURANT_CAPACITY = 100 //TODO calculate actual capacity
    var validInput = true;

    if (!($(name).val().match(/^\w+$/))){
      validInput = false;
      var warning1 = $('<div class="alert alert-warning alertParty"></div>').text("Name must contain at least one letter")
      warning1.append($('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'))
      $(form).append(warning1);      
    }

    if (!($(size).val().match(/^\d+$/) &&
      (parseInt($(size).val(),10) < RESTAURANT_CAPACITY))){
        //Error: Party size must be less than RESTAURANT_CAPACITY
      validInput = false;
      var warning2 = $('<div class="alert alert-warning alertParty"></div>').text("Party size must be between 1 and 100.")
      warning2.append($('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'))
      $(form).append(warning2);
    }

    if (!($(phone).val().match(/^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/))){
      //Error: Phone number must contain 10 digits
      validInput = false
      var warning3 = $('<div class="alert alert-warning alertParty"></div>').text("Phone number must contain 7 or 10 digits.")
      warning3.append($('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'))
      $(form).append(warning3);
    }


    if (!((time == "none") | (date == "none"))){ //Reservation, not Waitlist
      var currentDate = new Date()
      var reservationDate = new Date(($(date).val()));
      //TODO: check that time is >= current time if reservation is on current date
      if (!$(time).val().match(/^\d{2}:\d{2}\s(AM|PM)$/)){
        //Error: Time must have the format: hh:mm AM/PM
        validInput = false;
        var warning6 = $('<div class="alert alert-warning alertParty"></div>').text("Time must have the format: hh:mm AM/PM.")
        warning6.append($('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'))
        $(form).append(warning6);
      }
      if (!($(date).val().match(/^\d{2}\/\d{2}\/\d{4}$/))){
        validInput = false;
        var warning4 = $('<div class="alert alert-warning alertParty"></div>').text("Date must have the format: mm/dd/yyyy.")
        warning4.append($('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'))
        $(form).append(warning4);
      } 
      if (!(validDate(reservationDate, $(time).val(), currentDate))){
        validInput = false;
        var warning5 = $('<div class="alert alert-warning alertParty"></div>').text("Reservation cannot be in the past.")
        warning5.append($('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'))
        $(form).append(warning5);
      }

    }
    return validInput;
}

// check for upcoming reservations
function checkUpcomingReservations (seatMap) {
  timeRemaining = []
  
}


$(function() {
  var upcomingList = new UpcomingList();
  var extendedUpcomingList = new UpcomingList(); //zack
  var seatMap = new SeatMap();
  
  var waiters = ["Mike","Sarah","Adam","Don"];
  var currentWaiter = 0;

  var selectedParty = null;
  var selectedTable = null;

  Date.prototype.addHours = function(h) {    
    this.setTime(this.getTime() + (h*60*60*1000)); 
    return this;   
  }

  //http://stackoverflow.com/questions/1050720/adding-hours-to-javascript-date-object
  upcomingList.registerListener("add", function(event){
    console.log(event.entry);
    //don't draw entries that are 12 hours past current time
    if (event.entry.time) {
      if (event.entry.time > (new Date()).addHours(12)) {
        //add the entry to the extended list
        extendedUpcomingList.addEntry(event.entry);//zack
        $("#extendedUpcomingList").append(drawUpcomingListEntry(event.entry));
        console.log(extendedUpcomingList);
        return;
      }
    }

    upcomingListEntryView = drawUpcomingListEntry(event.entry);

    if ($("#upcomingList").children().length == 0) {
    	$("#upcomingList").append(upcomingListEntryView);	
    } else {
    	$("#upcomingList").children().eq(event.entry.position - 1).after(upcomingListEntryView);
    }

  });

  upcomingList.registerListener("update", function(event) {
  	console.log("update", event);
    if (event.entry.time) {
      //if the time is within 12 hours of now, and list entry isn't drawn, draw it
      if ($("#party" + event.entry.id).length == 0) {
        if (event.entry.time <= (new Date()).addHours(12)) {
          $("#upcomingList").append(drawUpcomingListEntry(event.entry));
        }else{//zack extended list
          $("#extendedUpcomingList").append(drawUpcomingListEntry(event.entry));
        }
      }
    }
    $("#party" + event.entry.id).replaceWith(drawUpcomingListEntry(event.entry));
  })

  upcomingList.registerListener("remove", function(event){
    //if party was selected, reset tooltip
    if (selectedParty && selectedParty.id == event.entry.id) {
      resetTooltip();
      selectedParty = null;
    }

    $("#party" + event.entry.id).remove()
  })

  seatMap.registerListener("addTable", function(event) {
  	addedTable = event.item;
  	tableView = drawTableView(addedTable);

  	$("#tablesArea").append(tableView);

  	tableLabel = drawTableIDLabel(tableView, addedTable);
  	capacityLabel = drawTableCapacityLabel(tableView, addedTable);
    
    tableView.after(capacityLabel);
    tableView.after(tableLabel);
  });

  seatMap.registerListener("updateTable", function(event) {
  	updatedTable = event.item;
  	tableView = $("#table" + updatedTable.id);

  	if (updatedTable.assignedParty) {
  		// A party was assigned to a table.
  		//tableView.after(drawPartyLabel(tableView, updatedTable));
  		$("#table" + updatedTable.id).css("fill", "#cc9933");
  		capacityText = capacityIcon + " " + updatedTable.assignedParty.partySize + " / " + updatedTable.capacity;
  		$("#table" + updatedTable.id + "Capacity").html(capacityText);
  	} else {
  		// A party was removed from a table.
  		tableView.css("fill", "#cccccc");
  		//$("#table" + updatedTable.id + "PartyLabel").remove();
  		$("#table" + updatedTable.id + "Capacity").html(capacityIcon + " 0  / " + updatedTable.capacity);	
  	}
  })

  seatMap.registerListener("addWaiterZone", function(event) {
    waiterZoneView = drawWaiterZone(event.item);
  	$("#waiterZones").append(waiterZoneView);
  	waiterZoneView.after(drawWaiterZoneLabel(event.item, seatMap))
  });

  seatMap.registerListener("updateWaiterZone", function(event) {
    $("#waiterZone" + event.item.id).replaceWith(drawWaiterZone(event.item));
    $("#" + event.item.id + "Waiter").replaceWith(drawWaiterZoneLabel(event.item, seatMap));
  })

  var retrievedList = localStorage.getItem('upcomingList');
  if (retrievedList !== null) {
    retrievedList = JSON.parse(retrievedList);
    for (var i = 0; i < retrievedList.length; i++) {
      currItem = retrievedList[i];
      // if Waitlist
      if (currItem.estimatedWaitInMins !== undefined) {
        upcomingList.addEntry(new WaitlistEntry(currItem.name, currItem.partySize, currItem.phone, currItem.estimatedWaitInMins));
      }
      // if Reservation
      else {
        upcomingList.addEntry(new Reservation(currItem.name, currItem.partySize, currItem.phone, new Date(currItem.time)));
      }
    }
  }
  else {
    // Initialize our interface with filler data.
    upcomingList.addEntry(new WaitlistEntry("Smith", 4, null, 10));
    upcomingList.addEntry(new WaitlistEntry("Johnson", 2, null, 40));
    //round time up to next hour
    roundedDate = new Date(Date.now() + 60 * 60000);
    roundedDate.setMinutes(0);
    roundedDate.setSeconds(0);
    upcomingList.addEntry(new Reservation("Sally", 6, null, roundedDate));
  }

  mikeZone = new WaiterZone("Mike", 380, 348, 30, 40, "#cc6600");
  sarahZone = new WaiterZone("Sarah", 380, 180, 400, 40, "#0052cc");
  adamZone = new WaiterZone("Adam", 380, 300, 593, 40, "green");
  donZone = new WaiterZone("Don", 125, 850, 30, 650, "red");

  var retrievedTables = localStorage.getItem('seatmapTables');
  if (retrievedTables !== null) {
    retrievedTables = JSON.parse(retrievedTables);
    for (var i = 0; i < retrievedTables.length; i++) {
      var currTable = retrievedTables[i];
      var assignedParty = null;
      if (currTable.assignedParty != null) {
        var party = currTable.assignedParty;
        var assignedParty = new UpcomingListEntry(party.name, party.partySize, party.assignedParty, party.id, new Date(party.seatedTime));
      }
      var table = new Table(currTable.id, currTable.capacity, currTable.x, currTable.y, currTable.style, currTable.orientation, currTable.types);
      seatMap.addTable(table);
      //add the assigned party and update
      table.assignedParty = assignedParty;
      seatMap.updateTable(table);
    }
  }
  else {
    seatMap.addTable(new Table(1, 6, 70, 80, "rect", "horizontal", ["inside", "booth"]));
    seatMap.addTable(new Table(2, 6, 70, 190, "rect", "horizontal", ["inside", "booth"]));
    seatMap.addTable(new Table(3, 6, 70, 300, "rect", "horizontal", ["inside", "booth"]));

    seatMap.addTable(new Table(4, 2, 320, 120, "ellipse", "horizontal", ["inside", "high-top"]));
    seatMap.addTable(new Table(5, 2, 320, 230, "ellipse", "horizontal", ["inside", "high-top"]));
    seatMap.addTable(new Table(6, 2, 320, 340, "ellipse", "horizontal", ["inside", "high-top"]));

    seatMap.addTable(new Table(7, 4, 485, 120, "ellipse", "horizontal", ["inside", "table"]));
    seatMap.addTable(new Table(8, 4, 485, 245, "ellipse", "horizontal", ["inside", "table"]));
    seatMap.addTable(new Table(9, 6, 410, 320, "rect", "horizontal", ["inside", "table"]));

    seatMap.addTable(new Table(10, 4, 620, 80, "rect", "horizontal", ["inside", "table"]));
    seatMap.addTable(new Table(11, 4, 620, 200, "rect", "horizontal", ["inside", "table"]));
    seatMap.addTable(new Table(12, 4, 620, 320, "rect", "horizontal", ["inside", "table"]));
    seatMap.addTable(new Table(13, 4, 760, 80, "rect", "horizontal", ["inside", "table", "handicap-accessible"]));
    seatMap.addTable(new Table(14, 4, 760, 200, "rect", "horizontal", ["inside", "table", "handicap-accessible"]));
    seatMap.addTable(new Table(15, 4, 760, 320, "rect", "horizontal", ["inside", "table", "handicap-accessible"]));

    seatMap.addTable(new Table(16, 2, 100, 710, "ellipse", "horizontal", ["outside", "table"]));
    seatMap.addTable(new Table(17, 2, 220, 710, "ellipse", "horizontal", ["outside", "table"]));
    seatMap.addTable(new Table(18, 2, 340, 710, "ellipse", "horizontal", ["outside", "table"]));
    seatMap.addTable(new Table(19, 2, 460, 710, "ellipse", "horizontal", ["outside", "table"]));
    seatMap.addTable(new Table(20, 2, 580, 710, "ellipse", "horizontal", ["outside", "table"]));
    seatMap.addTable(new Table(21, 2, 700, 710, "ellipse", "horizontal", ["outside", "table"]));
    seatMap.addTable(new Table(22, 2, 820, 710, "ellipse", "horizontal", ["outside", "table"]));
  }
  seatMap.addWaiterZone(mikeZone);
  seatMap.addWaiterZone(sarahZone);
  seatMap.addWaiterZone(adamZone);
  seatMap.addWaiterZone(donZone);
  console.log(seatMap);
  
  // Waitlist and Reservation Menus
 	$("#openReservationMenu").click(function() {
		$("#addPartyMenu").hide();
    $("#reservationMenu").collapse('show');
    $("#inputPartyNameReservation").focus();
    $("#inputDateReservation").datepicker().datepicker("setDate", new Date());
    $("#inputTimeReservation").timepicker({'step': 15, 'timeFormat': 'h:i A', 'forceRoundTime': true}).timepicker("setTime", new Date(new Date().getTime() + 15*60000));
  });
  $("#openWaitlistMenu").click(function() {
    $("#addPartyMenu").hide();
    $("#waitlistMenu").collapse('show');
    $("#inputPartyNameWaitlist").focus();
  });
  $("#cancelReservation").click(function() {
    $("#reservationMenu").collapse('hide');
    $("#reservationForm").trigger("reset");
    $("#addPartyMenu").show();
    $(".alertParty").remove();
  });
  $("#cancelWaitlist").click(function() {
    $("#waitlistMenu").collapse('hide');
    $("#waitlistForm").trigger("reset");
    $("#addPartyMenu").show();
    $(".alertParty").remove();
  });

  $("#cancelWaitlistEdit").click(function() {
    $("#waitlistEditMenu").collapse('hide');
    $("#waitlistEditMenu").trigger("reset");
    $("#addPartyMenu").show();
    $(".alertParty").remove();
  });

  $("#cancelReservationEdit").click(function() {
    $("#reservationEditMenu").collapse('hide');
    $("#reservationEditMenu").trigger("reset");
    $("#addPartyMenu").show();
    $(".alertParty").remove();
  });

  $("#showExtendedUpcoming").click(function() {
    $("#extendedUpcomingListPopUp").removeClass("hidden");
  });


  //add a Walk-in to Upcoming
  $("#addWaitlist").click(function(e) {
    $(".alertParty").remove();
    var name = $("#inputPartyNameWaitlist").val().substring(0,12); //truncate name to 12 letters
    var partySize = $("#inputPartySizeWaitlist").val();
    var phone = $("#inputPhoneNumberWaitlist").val();
    var types = $("#inputTypesWaitlist").val();
    
    eta = 1
    
    if (validUpcomingEntry("#waitlistMenu", "#inputPartyNameWaitlist", "#inputPartySizeWaitlist", "#inputPhoneNumberWaitlist")){
      $('#waitlistForm').trigger('reset');
      upcomingList.addEntry(new WaitlistEntry(name, partySize, phone, eta, types));
      $("#waitlistMenu").collapse('hide');
      $("#addPartyMenu").show();
      $(".alertParty").remove();
    }
  });

  //add a Reservation to Upcoming
  $("#addReservation").click(function(e) {
    $(".alertParty").remove();
    timeAndDate = new Date($('#inputDateReservation').val() + " " + $("#inputTimeReservation").val());
    name = $("#inputPartyNameReservation").val().substring(0,12); //truncate name to 12 letters;
    partySize = $("#inputPartySizeReservation").val();
    phone = $("#inputPhoneNumberReservation").val();
    time = $("#inputTimeReservation").val();
    date = $("#inputDateReservation").val();
    types = $("#inputTypesReservation").val();
    
    //if the form is filled out correctly
    if (validUpcomingEntry("#reservationMenu", "#inputPartyNameReservation", "#inputPartySizeReservation", "#inputPhoneNumberReservation", "#inputTimeReservation", "#inputDateReservation")){
      upcomingList.addEntry(new Reservation(name, partySize, phone, timeAndDate, null, types))
      $('#reservationForm').trigger('reset');
      $("#inputDateReservation").datepicker().datepicker("setDate", new Date()); ///Default date/time
      $("#inputTimeReservation").timepicker({'step': 15, 'timeFormat': 'h:i A', 'forceRoundTime': true}).timepicker("setTime", new Date());

      $("#reservationMenu").collapse('hide');
      $("#addPartyMenu").show();      
    }
    
  });

  //move party to a different table
  $("#moveParty").click(function(e){
    var party = selectedTable.assignedParty;
    console.log("PARTY");
    console.log(party);
    unseatTable();
   
    if (party.name == "Walk-In"){//if walk-in
      var entry = new WaitlistEntry(party.name, party.partySize, party.phone, 0, party.id, party.types)
    }else if (party.estimatedWaitInMins != null){ //if Waitlist entry
      var entry = new WaitlistEntry(party.name, party.partySize, party.phone, party.estimatedWaitInMins, party.id, party.types);
    }else{ //Reservation entry
      var entry = new Reservation(party.name, party.partySize, party.phone, party.time, party.id, party.types)
    }
    
    upcomingList.addEntry(entry);
    //autoselect entry from Upcoming list
    var partyId = "#party" + party.id;
    $(partyId).parent().find("a").removeClass('active');
    thisParty = upcomingList.getEntryWithID($(partyId).attr('id'));
    //if already selected, unselect
    if (selectedParty && selectedParty.id == thisParty.id) {
      selectedParty = null;
      resetTooltip();
    }
    //otherwise, select
    else {
      $(partyId).addClass('active');
      $("#filterSize").val(thisParty.partySize);
      $("#filterSize").change();
      $("#filterType").val(thisParty.types);
      $("#filterType").change();
      selectedParty = thisParty;
    }
  });

  $("#editWaitlist").click(function(e) {
    $(".alertParty").remove();
    if (validUpcomingEntry("#waitlistEditMenu", "#inputPartyNameWaitlistEdit", "#inputPartySizeWaitlistEdit", "#inputPhoneNumberWaitlistEdit")){
      editedEventID = parseInt($("#inputPartyIDWaitlistEdit").val(), 10);
      editedEvent = upcomingList.getEntryWithID(editedEventID);

      editedEvent.name = $("#inputPartyNameWaitlistEdit").substring(0,12); //truncate name to 12 letters;
      editedEvent.partySize = parseInt($("#inputPartySizeWaitlistEdit").val(), 10);
      editedEvent.phone = $("#inputPhoneNumberWaitlistEdit").val();
      editedEvent.types = $("#inputTypesWaitlistEdit").val();
      upcomingList.updateEntry(editedEvent);

      $("#waitlistEditMenu").collapse("hide");
      $("#addPartyMenu").show();
      $(".alert").remove();    
    }
  });

  $("#editReservation").click(function(e) {
    $(".alertParty").remove();
    if (validUpcomingEntry("#reservationEditMenu", "#inputPartyNameReservationEdit", "#inputPartySizeReservationEdit", "#inputPhoneNumberReservationEdit", "#inputTimeReservationEdit", "#inputDateReservationEdit")){
      editedEventID = parseInt($("#inputPartyIDReservationEdit").val(), 10);
      editedEvent = upcomingList.getEntryWithID(editedEventID);

      editedEvent.name = $("#inputPartyNameReservationEdit").substring(0,12); //truncate name to 12 letters;
      editedEvent.partySize = parseInt($("#inputPartySizeReservationEdit").val(), 10);
      editedEvent.phone = $("#inputPhoneNumberReservationEdit").val();
      editedEvent.types = $("#inputTypesReservationEdit").val();
      timeAndDate = new Date($('#inputDateReservationEdit').val() + " " + $("#inputTimeReservationEdit").val());
      editedEvent.time = timeAndDate
      upcomingList.updateEntry(editedEvent);

      $("#reservationEditMenu").collapse("hide");
      $("#addPartyMenu").show();
      $(".alertParty").remove();    
    }
  });

  //Add 'click' affordance upon hovering a table
  $(".restaurantTable").hover(
    function() {
      $(this).css("stroke-width","2");
    }, function() {
      $(this).css("stroke-width","1");
    }
  );

  $(".restaurantTable").click(function(e) {
    selectedTable = seatMap.getTableWithID($(this).attr("id"));
    
    hidePopups();
    if (selectedTable.isOccupied()) { // If the table is occupied, show the unseat popup, if it's open, show the seat popup.
    	halfWidth = parseInt($("#seatPopUp").css("width"), 10) / 2.0;
      $("#unseatPartyName").html(selectedTable.assignedParty.name);
      $("#unseatPartySeatedTime").html(get12hour(selectedTable.assignedParty.seatedTime.toString()));
      $("#unseatPartyETA").html(get12hour(new Date(Date.now() + selectedTable.assignedParty.getEstimatedTimeUntilPartyFinishes())));
    	// add 15 to top to account for tooltip
    	$("#unseatPopUp").slideDown("fast", "linear").css("top", e.pageY + 15).css("left", e.pageX - halfWidth);
    } else {
    	// Show seat popup unless the selected party won't fit at that table.
    	if (!(selectedParty && selectedParty.partySize > selectedTable.capacity)) showSeatPopup({x: e.pageX, y: e.pageY});
    }
  });

  //make enter key submit table seating
  $("#seatPopUp").keypress(function (e) {
    if (e.which == 13) {
      $('#seatTable').click();
      return false;    //<---- Add this line
    }
  });

  // Hide popups. Called when 'close' button in popup is clicked. Does not reset tooltip
  function hidePopups() {
      $("#sizeWarning").remove();
      $("#seatPopUp").hide();
      $("#unseatPopUp").hide();
  }

  // Hide popups. Called when floor clicked. This also resets the tooltip.
  function hidePopupsAndReset() {
      hidePopups();
      resetTooltip();
      $('#upcomingList').find("a").removeClass('active');
      selectedParty = null;
  }

  function resetPartySelector() {
    var walkInOption = $('<option value="walk-in" id="walk-in">Walk-In</option>');
    $("#seatPartySelector").html(walkInOption)
  }

  // Reset the tooltip to clear filter.
  function resetTooltip() {
    $("#inputWalkInPartySize").show();
    $("#filterSize").val("");
    $("#filterSize").change();
    $("#filterType").val("");
    $("#filterType").change();
    $("#seatPartySize").html(null);
  }

  function showSeatPopup(tipPoint) {
    resetPartySelector();
    $("#seatPartySelector").append(upcomingList.getUpcomingListEntries().filter(selectedTable.canPartyFit, selectedTable).map(drawPartyOption))
    if (selectedParty) $("#seatPartySelector").val("party" + selectedParty.id);

    var halfWidth = parseInt($("#seatPopUp").css("width"), 10) / 2.0;
    // add 15 to top to account for tooltip
    $("#seatPopUp").slideDown("fast", "linear").css("top", tipPoint.y + 15).css("left", tipPoint.x - halfWidth);
    //update waiter name
    $("#tableWaiter").html(seatMap.getWaiterZoneByTable(selectedTable).waiterName);

    selectSeatParty($("#seatPartySelector").val());
    $("#inputWalkInPartySizeFeedback").addClass("hidden");
    $("#seatPartySizeGroup").removeClass("has-error");
      
    $("#inputWalkInPartySize").focus();
  }

  function selectSeatParty(partyID) {
    if (partyID == "walk-in") {
      $("#inputWalkInPartySize").show();
      $("#seatPartySize").html(null);
    } else {
      $("#inputWalkInPartySize").hide();
      $("#seatPartySize").html(upcomingList.getEntryWithID(partyID).partySize);
    }
  }

  function applyFilters(targetElement=0) {
  	seatMap.getOpenTables().map(getViewForTable).map(function(element) {element.css("fill", "#cccccc")});

    partySizeText = $("#filterSize").val();
    serverText = $("#filterServer").val();
    typeText = $("#filterType").val();

    partySize = null;
    server = null;
    type = null;
   
    if (partySizeText != "") partySize = parseInt(partySizeText, 10); 
    if (serverText != null) server = serverText;
    if (typeText != null) {
      for (var i in typeText) {
        typeText[i] = typeText[i].toLowerCase();
      }
      type = typeText;
    }

    matchingList = seatMap.getOpenTablesMatchingFilters(partySize, server, type);
    matchingList.map(getViewForTable).map(function(element) {element.css("fill", "#ccffcc")});
    
  }

  $("#seatPartySelector").change(function(event) {
    selectSeatParty(event.target.value);
  })

  //hide popups and reset filters when you click the floor
  $("#floor").click(hidePopupsAndReset);
  // Hide popups when close button in popup clicked.
  $(".close").click(hidePopups);

  $("#seatTable").click(function() {
    $("#sizeWarning").remove();
  	partyToSeatID = $("#seatPartySelector").val();
  	if (partyToSeatID == "walk-in") {
  		partySize = $("#inputWalkInPartySize").val();
      //Give warning if attempting to seat a walk-in party that is larger than the table capacity
      //TODO can't figure out why party size gets set to 0 after the alert
      if (partySize > selectedTable.capacity){
        var sizeWarning = $('<div id="sizeWarning" class="alert alert-danger"></div>').text("This table can only fit " + selectedTable.capacity + " people.");
        $("#seatPartySizeGroup").append(sizeWarning);
        return;
      }else if (partySize == 0){
        var sizeWarning = $('<div id="sizeWarning" class="alert alert-danger"></div>').text("Party Size must be greater than 0.");
        $("#seatPartySizeGroup").append(sizeWarning);
        return;     
      }
  		partyToSeat = new UpcomingListEntry("Walk-In", partySize);
  	} else {
  		partyToSeat = upcomingList.getEntryWithID(partyToSeatID)
  		partyToSeat.seatedTime = new Date();
  		upcomingList.removeEntryWithID(partyToSeat.id);
  	}
    
    console.log(seatMap.getTimeUntilNextTable());
    console.log(upcomingList.getNextReservationTime());
    if (seatMap.getTimeUntilNextTable() > upcomingList.getNextReservationTime()) {
      if(!confirm("You have an upcoming reservation before the next table is expected to be free!"))
        return;
    }
  	selectedTable.assignedParty = partyToSeat;
  	seatMap.updateTable(selectedTable);

    $("#filterSize").val("");
    $("#filterSize").change();
    $("#filterType").val("");
    $("#filterType").change();
    resetTooltip();
    $("#seatPopUp").hide();
  });

  //removes party from table
  var unseatTable = function() {
    selectedTable.assignedParty = null;
    seatMap.updateTable(selectedTable);
    selectedTable = null;
    $("#filterSize").change();
    $("#unseatPopUp").hide();
  };

  $("#unseatTable").click(unseatTable);

  $("#filterSize").on('change input', function() {
    //if there is a partySize in the filter, highlight valid tables
    applyFilters();
    $("#inputWalkInPartySize").val($(this).val());
  });

  $("#filterServer").on('change', applyFilters);
  $("#filterType").on('change', applyFilters);

  //upon clicking items in Upcoming List
  $(document).on('click', ".upcoming-party", function(e) {
    $(this).parent().find("a").removeClass('active');
    thisParty = upcomingList.getEntryWithID($(this).attr('id'));
    
    //if already selected, unselect
    if (selectedParty && selectedParty.id == thisParty.id) {
      selectedParty = null;
      resetTooltip();
      $("#table" + String(seatMap.getTableBestFit(partySize).id)).css("fill", "#cccccc");      
    }
    //otherwise, select
    else {
      $(this).addClass('active');
      $("#filterSize").val(thisParty.partySize);
      $("#filterSize").change();
      $("#filterType").val(thisParty.types);
      $("#filterType").change();
      selectedParty = thisParty;
      
      $("#table" + String(seatMap.getTableBestFit(partySize).id)).css("fill", "#00cc00");
    }
  });

  $(document).on('click', ".remove-upcoming-party", function(e) {
    //stop propagation so parents click method not called

    e.stopPropagation();

    correspondingPartyView = $(this).parents(".upcoming-party")[0];
    upcomingList.removeEntryWithID(correspondingPartyView.id);
  });

  $(document).on('click', ".edit-upcoming-party", function(e) {
    //stop propagation so parents click method not called
    e.stopPropagation();

    correspondingPartyView = $(this).parents(".upcoming-party")[0];
    correspondingParty = upcomingList.getEntryWithID(correspondingPartyView.id);
    
    //Checks if upcoming entry is Reservation or Waitlist
    if (correspondingParty.getCountdownString().match(/(AM|PM)$/)){
      //Show edit Reservation menu
      $("#waitlistEditMenu").collapse("hide");
      $("#addPartyMenu").hide();
      $("#reservationEditMenu").collapse('show');
      $("#inputPartyNameReservationEdit").focus()
      var d1 = new Date(correspondingParty.time);
      $("#inputPartyNameReservationEdit").val(correspondingParty.name);
      $("#inputPartyIDReservationEdit").val(correspondingParty.id);
      $("#inputPartySizeReservationEdit").val(correspondingParty.partySize);
      $("#inputPhoneNumberReservationEdit").val(correspondingParty.phone);
      $("#inputTypesReservationEdit").val(correspondingParty.types);
      $("#inputDateReservationEdit").datepicker().datepicker("setDate", d1); ///Default date/time
      $("#inputTimeReservationEdit").timepicker({'step': 15, 'timeFormat': 'h:i A', 'forceRoundTime': true}).timepicker("setTime", d1);
    }else{
      //Show the edit waitlist menu.
      $("#reservationEditMenu").collapse("hide");
      $("#addPartyMenu").hide();
      $("#waitlistEditMenu").collapse('show');
      $("#inputPartyNameWaitlistEdit").focus()

      $("#inputPartyNameWaitlistEdit").val(correspondingParty.name);
      $("#inputPartyIDWaitlistEdit").val(correspondingParty.id);
      $("#inputPartySizeWaitlistEdit").val(correspondingParty.partySize);
      $("#inputPhoneNumberWaitlistEdit").val(correspondingParty.phone);
      $("#inputTypesWaitlistEdit").val(correspondingParty.types);
    }

  });

  /* pan-zoom stuff taken from https://github.com/timmywil/jquery.panzoom/blob/master/demo/index.html */
  var $section = $('#focal');
  var $panzoom = $section.find('.panzoom').panzoom({ 
    contain: 'invert' });
  $panzoom.parent().on('mousewheel.focal', function( e ) {
    $("#seatPopUp").hide();
    $("#unseatPopUp").hide();
    e.preventDefault();
    var delta = e.delta || e.originalEvent.wheelDelta;
    var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
    $panzoom.panzoom('zoom', zoomOut, {
      increment: 0.1,
      animate: false,
      focal: e
    });
  });

  // This revents the seat map from being scaled too large.
  setMinScale = function() {
    minScale = $(".parent").width() / $(".panzoom").width();
    $panzoom.panzoom('option', 'minScale', minScale);
    $panzoom.panzoom('resetPan')
  }
  $(window).resize(setMinScale);
  setMinScale()

   $panzoom.panzoom('option', 'maxScale', 3.0);
});
