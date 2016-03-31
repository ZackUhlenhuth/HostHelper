$(function() {

	$("#openReservationMenu").click(function() {
		$("#addPartyMenu").hide();
    $("#reservationMenu").collapse('show');
  });

  $("#openWaitlistMenu").click(function() {
    $("#addPartyMenu").hide();
    $("#waitlistMenu").collapse('show');
  });

  $("#cancelReservation").click(function() {
    $("#reservationMenu").collapse('hide');
    $("#addPartyMenu").show();
  });

  $("#cancelWaitlist").click(function() {
    $("#waitlistMenu").collapse('hide');
    $("#addPartyMenu").show();
  });

  $(".restaurantTable").hover(
    function() {
      $(this).attr("stroke-width","2");
    }, function() {
      $(this).attr("stroke-width","1");
    }
  );

  var selectedTable;
  $(".restaurantTable").click(function(e) {
    selectedTable = $(this);
    if (selectedTable.attr('occupied') == 'false') {
      var halfWidth = parseInt($("#seatPopUp").css("width"), 10) / 2.0;
      $("#seatPopUp").hide();
      //add 15 to top to account for tooltip
      $("#seatPopUp").slideDown("fast", "linear").css("top", e.pageY + 15).css("left", e.pageX - halfWidth);
    }
    else {
      var halfWidth = parseInt($("#seatPopUp").css("width"), 10) / 2.0;
      $("#unseatPopUp").hide();
      //add 15 to top to account for tooltip
      $("#unseatPopUp").slideDown("fast", "linear").css("top", e.pageY + 15).css("left", e.pageX - halfWidth);
    }
  });

  $("#floor").click(function() {
    $("#seatPopUp").hide();
    $("#unseatPopUp").hide();
  });

  $("#seatTable").click(function() {
    selectedTable.attr("fill", "#cc9933");
    selectedTable.attr("occupied", "true");
    $("#filterSize").val("");
    $("#filterSize").change();
    $("#seatPopUp").hide();
  });

  $("#unseatTable").click(function() {
    selectedTable.attr("fill", "#cccccc");
    selectedTable.attr("occupied", "false");
    $("#unseatPopUp").hide();
  });

  $("#filterSize").on('change input', function() {
    var partySize = $(this).val();
    $(".restaurantTable[occupied=false]").attr("fill", "#cccccc");
    $(".restaurantTable[occupied=false][table-capacity='" + partySize + "']").attr("fill", "#ccff99");
  });

  $(".list-group a").click(function() {
    $(this).parent().find("a").removeClass('active');
    $(this).addClass('active');
    var partySize = $(this).attr('party-size');
    $("#filterSize").val(partySize);
    $("#filterSize").change();
  });

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