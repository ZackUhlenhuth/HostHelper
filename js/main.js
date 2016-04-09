// Modified from "Cut & Paste Live Clock using forms" by George Chiang,
// http://javascriptkit.com/script/cut2.shtml
function show(){
  var Digital=new Date();
  var hours=Digital.getHours();
  var minutes=Digital.getMinutes();
  var dn="PM";
  
  if (hours>12){
    dn="PM";
    hours=hours-12;
  }
  if (hours==0)
    hours=12;
  if (minutes<=9)
    minutes="0"+minutes;
    
  $("#clock").html(hours+":"+minutes+" "+dn);
  setTimeout("show()",1000);
}
show();

$(function() {
  var upcomingList = new UpcomingList();
  var $selectedParty;
  var $selectedTable;

  upcomingList.registerListener("add", function(event){
    var editButtons = $("<span class='pull-right'>" + 
                  "<button class='btn btn-xs btn-warning edit-upcoming-party'><span class='glyphicon glyphicon-pencil'></span></button>" +
                  "<button class='btn btn-xs btn-danger remove-upcoming-party'><span class='glyphicon glyphicon-remove'></span></button>" +
                  "</span>");

    newEntry = $("<a href='#' class='list-group-item clearfix upcoming-party'></a>");
    newEntry.attr('party-name', event.entry.name);
    newEntry.attr('party-size', event.entry.partySize);
    newEntry.attr('party-phone', event.entry.phone);
    newEntry.attr('id', 'party' + event.entry.id);
    newEntry.html(event.entry.name + " - " + event.entry.partySize);
    newEntry.append(editButtons);
    $("#upcomingList").append(newEntry);
  });

  // Initialize our upcoming list entries.
  upcomingList.addEntry(new WaitlistEntry("Smith", 4, "None"));
  upcomingList.addEntry(new WaitlistEntry("Johnson", 6, "None"));
  upcomingList.addEntry(new WaitlistEntry("Sally", 6, "None"));

  // Waitlist and Reservation Menus
	$("#openReservationMenu").click(function() {
		$("#addPartyMenu").hide();
    $("#reservationMenu").collapse('show');
    $("#inputPartyName").focus();
  });
  $("#openWaitlistMenu").click(function() {
    $("#addPartyMenu").hide();
    $("#waitlistMenu").collapse('show');
    $("#inputPartyNameWaitlist").focus()
  });
  $("#cancelReservation").click(function() {
    $("#reservationMenu").collapse('hide');
    $("#addPartyMenu").show();
  });
  $("#cancelWaitlist").click(function() {
    $("#waitlistMenu").collapse('hide');
    $("#addPartyMenu").show();
  });


  $("#addWaitlist").click(function(e) {
    name = $("#inputPartyNameWaitlist").val();
    partySize = $("#inputPartySizeWaitlist").val();
    phone = $("inputPhoneNumberWaitlist").val();

    //reset the input fields
    $('#waitlistForm').trigger('reset');

    upcomingList.addEntry(new WaitlistEntry(name, partySize, phone));

    $("#waitlistMenu").collapse('hide');
    $("#addPartyMenu").show();
  });

  $("#addReservation").click(function(e) {
    name = $("#inputPartyName").val();
    partySize = $("#inputPartySizeReservation").val();
    phone = $("inputPhoneNumber").val();
    time = $("inputTime").val();
    date = $('inputDate').val();

    timeAndDate = new Date(date + " " + time);

    upcomingList.addEntry(new Reservation(name, partySize, phone, timeAndDate))

    //reset the input fields
    $('#reservationForm').trigger('reset');
    $("#inputDateReservation").datepicker().datepicker("setDate", new Date()); //default date to current date

    $("#reservationMenu").collapse('hide');
    $("#addPartyMenu").show();
  });
  
  $("#inputDateReservation").datepicker().datepicker("setDate", new Date());

  // Citation: http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element
  function makeSVG(tag, attrs) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs)
      e.setAttribute(k, attrs[k]);
    return e;
  }

  // programatically add waiter labels to waiter zones
  $(".waiterZone").after(function() {
    var zoneId = $(this).attr('id');
    var x = parseInt($(this).attr('x'), 10);
    var y = parseInt($(this).attr('y'), 10);
    // coordinates for label
    var xCoord = x + 10; //hardcoded
    var yCoord = y - 4;
    var labelColor = $(this).css('stroke');
    var waiterName = $(this).attr('waiter-name');
    var waiterLabel = makeSVG('text', {id: zoneId + 'Waiter', fill: labelColor, 'font-size': '14', 'font-family': 'Verdana', x: xCoord, y: yCoord});
    waiterLabel.innerHTML = waiterName;
    console.log(waiterName);
    return waiterLabel;
  });

  // programatically add id labels to tables
  $(".restaurantTable").after(function() {
    var tableId = $(this).attr('id');
    var width = parseInt($(this).attr('width'), 10);
    var x = parseInt($(this).attr('x'), 10) + (width / 2.0);
    var y = parseInt($(this).attr('y'), 10);
    // if it is a circle (cx, cy, rx)
    if (!x) {
      x = parseInt($(this).attr('cx'), 10);
      y= parseInt($(this).attr('cy'), 10) - parseInt($(this).attr('ry'), 10);
      width = parseInt($(this).attr('rx'), 10);
    }
    var xCoord = x - 10;
    var yCoord = y + 20;
    var hashtagIcon = "&#xf292";
    var tableLabel = makeSVG('text', {id: tableId + 'Label', class: 'infoLabel', x: xCoord, y: yCoord});
    tableLabel.innerHTML = hashtagIcon + " " + parseInt($(this).attr('id').replace("table", ""), 10);
    return tableLabel;
  });

  var capacityIcon = "&#xf0c0";
  // programatically add capacity labels to tables
  $(".restaurantTable").after(function() {
    var tableId = $(this).attr('id');
    var width = parseInt($(this).attr('width'), 10);
    var x = parseInt($(this).attr('x'), 10) + (width / 2.0);
    var y = parseInt($(this).attr('y'), 10) + parseInt($(this).attr('height'), 10);
    // if it is a circle (cx, cy, rx)
    if (!x) {
      x = parseInt($(this).attr('cx'), 10);
      y= parseInt($(this).attr('cy'), 10) + parseInt($(this).attr('ry'), 10);
      width = parseInt($(this).attr('rx'), 10);
    }
    var xCoord = x - 20;
    var yCoord = y - 10;
    var capacity = $(this).attr('table-capacity');
    var capacityLabel = makeSVG('text', {id: tableId + 'Capacity', class: 'infoLabel', 'table-capacity': capacity, x: xCoord, y: yCoord});
    capacityLabel.innerHTML = capacityIcon + " 0 / " + capacity;
    return capacityLabel;
  });

  $(".restaurantTable").hover(
    function() {
      $(this).css("stroke-width","2");
    }, function() {
      $(this).css("stroke-width","1");
    }
  );

  $(".restaurantTable").click(function(e) {
    $selectedTable = $(this);
    $("#seatPopUp").hide();
    $("#unseatPopUp").hide();
    if ($selectedTable.attr('occupied') == 'false') {
      // if there is a selected party, only show pop-up if it can fit
      var validSelection = true;
      if ($selectedParty && parseInt($selectedParty.attr("party-size"), 10) > parseInt($selectedTable.attr('table-capacity'), 10)) { 
        validSelection = false; 
      };
      if (validSelection) {
        showSeatPopup({x: e.pageX, y: e.pageY});
      }
    }
    else {
      var halfWidth = parseInt($("#seatPopUp").css("width"), 10) / 2.0;
      // add 15 to top to account for tooltip
      $("#unseatPopUp").slideDown("fast", "linear").css("top", e.pageY + 15).css("left", e.pageX - halfWidth);
    }
  });

  //make enter key submit table seating
  $("#seatPopUp").keypress(function (e) {
    if (e.which == 13) {
      $('#seatTable').click();
      return false;    //<---- Add this line
    }
  });

  // Hide popups. Called when closed button in popup or floor clicked.
  function hidePopups() {
      $("#seatPopUp").hide();
      $("#unseatPopUp").hide();
  }

  // Reset the tooltip to prepare for a walk-in.
  function resetTooltip() {
    $("#inputWalkInPartySize").show();
    $("#filterSize").val(null);
    $("#filterSize").change();
    $("#seatPartySize").html(null);

    var walkInOption = $('<option value="walk-in" id="walk-in">Walk-In</option>');
    $("#seatPartySelector").html(walkInOption)

    $.each(upcomingList.getUpcomingListEntries(), function(index, entry){
      var partyOption = $('<option></option>');
      partyOption.attr("id", "party" + entry.id);
      partyOption.attr("value", "party" + entry.id);
      partyOption.html(entry.name);

      $("#seatPartySelector").append(partyOption);     
    });

    $("#inputWalkInPartySize").show();
  }

  function showSeatPopup(tipPoint) {
    resetTooltip();

    if ($selectedParty) {
      $("#seatPartySelector").val($selectedParty[0].id);
    }

    var halfWidth = parseInt($("#seatPopUp").css("width"), 10) / 2.0;
    // add 15 to top to account for tooltip
    $("#seatPopUp").slideDown("fast", "linear").css("top", tipPoint.y + 15).css("left", tipPoint.x - halfWidth);
    //update waiter name
    var waiterName = $selectedTable.attr('waiter');
    $("#tableWaiter").html(waiterName);

    selectSeatParty($("#seatPartySelector").val());
      
    $("#inputWalkInPartySize").focus();
  }

  function selectSeatParty(partyID) {
    if (partyID == "walk-in") {
      $("#inputWalkInPartySize").show();
    } else {
      $("#inputWalkInPartySize").hide();

      entry = upcomingList.getEntryWithID(partyID);
      $("#seatPartySize").html(entry.partySize);
    }
  }

  $("#seatPartySelector").change(function(event) {
    selectSeatParty(event.target.value);
  })

  //hide popups when you click the floor TODO: should make this happen on any click but table
  $("#floor").click(hidePopups);
  // Hide popups when close button in popup clicked.
  $(".close").click(hidePopups);

  $("#seatTable").click(function() {
    $selectedTable.css("fill", "#cc9933");
    $selectedTable.attr("occupied", "true");
    //create party name label
    var tableId = $selectedTable.attr('id');
    var xCoord = parseInt($("#" + tableId + "Label").attr('x'), 10) - 10;
    var yCoord = parseInt($("#" + tableId + "Label").attr('y'), 10) + 20;
    var partyLabel = makeSVG('text', {id: tableId + 'PartyLabel', class: "partyLabel", x: xCoord, y: yCoord});
    selectedEntry = upcomingList.getEntryWithID($("#seatPartySelector").val());

    if (selectedEntry) {
      //update capacity label
      $("#" + tableId + "Capacity").html(function() {
        return capacityIcon + " " + selectedEntry.partySize + " / " + $(this).attr('table-capacity');
      });

      console.log(selectedEntry.name);
      partyLabel.innerHTML = selectedEntry.name;
      $selectedTable.after(partyLabel);

      resetTooltip();

      upcomingList.removeEntryWithID(entry.id);
    }
    else { //Walk-In
      var partySize = $("#inputWalkInPartySize").val();
      //if partySize is specified
      if (partySize) {
        //if party can fit at table
        if (parseInt(partySize, 10) <= parseInt($("#" + tableId).attr('table-capacity'), 10)) {
          $("#" + tableId + "Capacity").html(function() {
            return capacityIcon + " " + $("#inputWalkInPartySize").val() + " / " + $(this).attr('table-capacity');
          });
        }
      }
      partyLabel.innerHTML = "Walk-in";
      $selectedTable.after(partyLabel);
    }
    $("#filterSize").val("");
    $("#filterSize").change();
    $("#seatPopUp").hide();
  });

  $("#unseatTable").click(function() {
    $selectedTable.css("fill", "#cccccc");
    $selectedTable.attr("occupied", "false");
    var tableId = $selectedTable.attr('id');
    $("#" + tableId + "PartyLabel").remove();
    $("#" + tableId + "Capacity").html(function() {
      return capacityIcon + " 0 " + " / " + $(this).attr('table-capacity');
    });
    $("#filterSize").change();
    $("#unseatPopUp").hide();
  });

  $("#filterSize").on('change input', function() {
    var partySize = $(this).val();
    $(".restaurantTable[occupied=false]").css("fill", "#cccccc");
    //if there is a partySize in the filter, highlight valid tables
    if (partySize !== "") {
      $(".restaurantTable[occupied=false]").filter(function() {
        return partySize <= parseInt($(this).attr('table-capacity'), 10);
      }).css("fill", "#ccff99");
      $("#inputWalkInPartySize").val(partySize);
    } else {
      $("#inputWalkInPartySize").val(null);
    }
  });

  //upon clicking items in Upcoming List
  $(document).on('click', ".upcoming-party", function(e) {
    $(this).parent().find("a").removeClass('active');
    //if already selected, unselect
    if ($selectedParty && $selectedParty.attr('id') === $(this).attr('id')) {
      $("#filterSize").val(null);
      $("#filterSize").change();
      $selectedParty = null;

      resetTooltip();
    }
    //otherwise, select
    else {
      $(this).addClass('active');
      var partySize = $(this).attr('party-size');
      $("#filterSize").val(partySize);
      $("#filterSize").change();
      $selectedParty = $(this);
    }
  });

  upcomingList.registerListener("remove", function(event){
    //if party was selected, reset tooltip
    if ($selectedParty && $selectedParty.attr('id') === "party" + event.entry.id) {
      resetTooltip();
      $selectedParty = null;
    }

    $("#party" + event.entry.id).remove()
  })

  $(document).on('click', ".remove-upcoming-party", function(e) {
    //stop propagation so parents click method not called
    e.stopPropagation();

    //remove the upcoming party (the grandparent)
    $correspondingParty = $(this).parent().parent();

    partyID = $correspondingParty[0].id;
    upcomingList.removeEntryWithID(partyID);
  });

  $(document).on('click', ".edit-upcoming-party", function(e) {
    //stop propagation so parents click method not called
    e.stopPropagation();
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
  }
  $(window).resize(setMinScale);
  setMinScale()
});

