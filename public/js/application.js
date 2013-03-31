$(document).ready(function() {
	$(function() {
    $('#datetimepicker4').datetimepicker({
      maskInput: true,           // disables the text input mask
		  pickDate: true,            // disables the date picker
		  pickTime: false,            // disables de time picker
		  pick12HourFormat: false,   // enables the 12-hour format time picker
		  pickSeconds: true,         // disables seconds in the time picker
		  startDate: new Date(),      // set a minimum date
		  endDate: Infinity          // set a maximum date
    });
  });

  $(function() {
    var availableTags = [
      "San Francisco International, CA (SFO)"
    ];
    $("#origin").autocomplete({
      source: availableTags
    });
  });

  $(function() {
    var availableTags = [
      "New York John F Kennedy International, NY (JFK)",
      "Houston George Bush Intercntl, TX (IAH)",
      "Chicago O'Hare, IL (ORD)"
    ];
    $("#destination").autocomplete({
      source: availableTags
    });
  });
});