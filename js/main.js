// Modified from "Cut & Paste Live Clock using forms" by George Chiang,
// http://javascriptkit.com/script/cut2.shtml
function show(){
  var Digital=new Date()
  var hours=Digital.getHours()
  var minutes=Digital.getMinutes()
  var dn="PM"
  
  if (hours>12){
    dn="PM"
    hours=hours-12
  }
  if (hours==0)
    hours=12
  if (minutes<=9)
    minutes="0"+minutes
    
  document.Tick.Clock.value=hours+":"+minutes+" "+dn
  setTimeout("show()",1000)
}
show();

$(function() {

	$("#openReservationMenu").click(function() {
		$("#addPartyMenu").hide();
    $("#reservationMenu").collapse('show');
    $("#inputPartyName").focus();
  });

  $("#openWaitlistMenu").click(function() {
    $("#addPartyMenu").hide();
    $("#waitlistMenu").collapse('show');
    $("#inputPartyNameWaitlist").focus();
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
    console.log($(this));
    name = $("#inputPartyNameWaitlist").val();
    partySize = $("#inputPartySizeWaitlist").val();
    phone = $("inputPhoneNumberWaitlist").val();

    newEntry = $("<a href='#' class='list-group-item'></a>");
    newEntry.attr('party-name', name);
    newEntry.attr('party-size', partySize);
    newEntry.attr('party-phone', phone);
    newEntry.html(name + " - " + partySize);  
    $("#upcomingList").append(newEntry);
    refreshUpcomingList();

    $("#waitlistMenu").collapse('hide');
    $("#addPartyMenu").show();
  });

  //Citation: http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element
  function makeSVG(tag, attrs) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs)
      e.setAttribute(k, attrs[k]);
    return e;
  }

  //programatically add waiter labels to waiter zones
  $(".waiterZone").after(function() {
    var zoneId = $(this).attr('id');
    var x = parseInt($(this).attr('x'), 10);
    var y = parseInt($(this).attr('y'), 10);
    //coordinates for label
    var xCoord = x + 10; //hardcoded
    var yCoord = y - 4;
    var labelColor = $(this).attr('stroke');
    var waiterName = $(this).attr('waiter-name');
    var waiterLabel = makeSVG('text', {id: zoneId + 'Waiter', fill: labelColor, 'font-size': '14', 'font-family': 'Verdana', x: xCoord, y: yCoord});
    waiterLabel.innerHTML = waiterName;
    return waiterLabel;
  });

  //programatically add id labels to tables
  $(".restaurantTable").after(function() {
    var tableId = $(this).attr('id');
    var width = parseInt($(this).attr('width'), 10);
    var x = parseInt($(this).attr('x'), 10) + (width / 2.0);
    var y = parseInt($(this).attr('y'), 10);
    //if it is a circle (cx, cy, rx)
    if (!x) {
      x = parseInt($(this).attr('cx'), 10);
      y= parseInt($(this).attr('cy'), 10) - parseInt($(this).attr('ry'), 10);
      width = parseInt($(this).attr('rx'), 10);
    }
    var xCoord = x - 10;
    var yCoord = y + 20;
    var hashtagIcon = "&#xf292";
    var tableLabel = makeSVG('text', {id: tableId + 'Label', fill: 'black', 'font-size': '12', 'font-family': 'FontAwesome', x: xCoord, y: yCoord});
    tableLabel.innerHTML = hashtagIcon + " " + parseInt($(this).attr('id').replace("table", ""), 10);
    return tableLabel;
  });

  var capacityIcon = "&#xf0c0";
  //programatically add capacity labels to tables
  $(".restaurantTable").after(function() {
    var tableId = $(this).attr('id');
    var width = parseInt($(this).attr('width'), 10);
    var x = parseInt($(this).attr('x'), 10) + (width / 2.0);
    var y = parseInt($(this).attr('y'), 10) + parseInt($(this).attr('height'), 10);
    //if it is a circle (cx, cy, rx)
    if (!x) {
      x = parseInt($(this).attr('cx'), 10);
      y= parseInt($(this).attr('cy'), 10) + parseInt($(this).attr('ry'), 10);
      width = parseInt($(this).attr('rx'), 10);
    }
    var xCoord = x - 20;
    var yCoord = y - 10;
    var capacity = $(this).attr('table-capacity');
    var capacityLabel = makeSVG('text', {id: tableId + 'Capacity', 'table-capacity': capacity, fill: 'black', 'font-size': '12', 'font-family': 'FontAwesome', x: xCoord, y: yCoord});
    capacityLabel.innerHTML = capacityIcon + " 0 / " + capacity;
    return capacityLabel;
  });

  $(".restaurantTable").hover(
    function() {
      $(this).attr("stroke-width","2");
    }, function() {
      $(this).attr("stroke-width","1");
    }
  );

  var $selectedTable;
  $(".restaurantTable").click(function(e) {
    $selectedTable = $(this);
    $("#seatPopUp").hide();
    $("#unseatPopUp").hide();
    if ($selectedTable.attr('occupied') == 'false') {
      //if there is a selected party, only show pop-up if it can fit
      var validSelection = true;
      if ($selectedParty && parseInt($selectedParty.attr("party-size"), 10) > parseInt($selectedTable.attr('table-capacity'), 10)) { 
        validSelection = false; 
      };
      if (validSelection) {
        var halfWidth = parseInt($("#seatPopUp").css("width"), 10) / 2.0;
        //add 15 to top to account for tooltip
        $("#seatPopUp").slideDown("fast", "linear").css("top", e.pageY + 15).css("left", e.pageX - halfWidth);
        $("#inputWalkInPartySize").focus();
      }
    }
    else {
      var halfWidth = parseInt($("#seatPopUp").css("width"), 10) / 2.0;
      //add 15 to top to account for tooltip
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

  //hide popups when you click the floor TODO: should make this happen on any click but table
  $("#floor").click(function() {
    $("#seatPopUp").hide();
    $("#unseatPopUp").hide();
  });

  $("#seatTable").click(function() {
    $selectedTable.attr("fill", "#cc9933");
    $selectedTable.attr("occupied", "true");
    //create party name label
    var tableId = $selectedTable.attr('id');
    var xCoord = parseInt($("#" + tableId + "Label").attr('x'), 10) - 10;
    var yCoord = parseInt($("#" + tableId + "Label").attr('y'), 10) + 20;
    var partyLabel = makeSVG('text', {id: tableId + 'PartyLabel', fill: 'black', 'font-size': '14', 'font-family': 'Verdana', x: xCoord, y: yCoord});
    if ($selectedParty) {
      //update capacity label
      $("#" + tableId + "Capacity").html(function() {
        return capacityIcon + " " + $selectedParty.attr('party-size') + " / " + $(this).attr('table-capacity');
      });
      partyLabel.innerHTML = $selectedParty.attr('party-name');
      $selectedTable.after(partyLabel);
      $selectedParty.remove();
      $selectedParty = null;
      $("#inputWalkInPartySize").show();
      $("#seatPartySize").html("");
      $("#seatPartyName").html("Walk-In");
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
    $selectedTable.attr("fill", "#cccccc");
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
    $(".restaurantTable[occupied=false]").attr("fill", "#cccccc");
    //if there is a partySize in the filter, highlight valid tables
    if (partySize !== "") {
      $(".restaurantTable[occupied=false]").filter(function() {
        return partySize <= parseInt($(this).attr('table-capacity'), 10);
      }).attr("fill", "#ccff99");
      $("#inputWalkInPartySize").val(partySize);
    }
  });


  var $selectedParty;
  var refreshUpcomingList = function(){
    $(".list-group a").click(function() {
      $(this).parent().find("a").removeClass('active');
      $(this).addClass('active');
      var partySize = $(this).attr('party-size');
      var partyName = $(this).attr('party-name');
      $("#filterSize").val(partySize);
      $("#filterSize").change();
      $selectedParty = $(this);
      $("#inputWalkInPartySize").hide();
      $("#seatPartySize").html(partySize);
      $("#seatPartyName").html(partyName);
    });
  };
  refreshUpcomingList();


  /* pan-zoom stuff taken from https://github.com/timmywil/jquery.panzoom/blob/master/demo/index.html */
  var $section = $('#focal');
  var $panzoom = $section.find('.panzoom').panzoom();
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

});
