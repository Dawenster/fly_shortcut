jQuery(document).ready(function($) {
	checkInput();
});

function checkInput()
{
	// Tabs
	$('#tabs').tabs();
	
	// Radio tab
	$('#radio' ).buttonset();
	
	// Auto complete - origin
	$( "#search_from" ).autocomplete({
		source: "http://www.flyshortcut.com/wp-content/themes/journalcrunch/auto_complete.php",
		minLength: 1,
		autoFocus: true,
		delay: 0
	});
	
	// Auto complete - destination
	$( "#search_dest" ).autocomplete({
		source: "http://www.flyshortcut.com/wp-content/themes/journalcrunch/auto_complete.php",
		minLength: 1,
		autoFocus: true
	});
	
	// Datepicker
	$('#datepicker').datepicker({
		dateFormat: 'yy-mm-dd',
		minDate: new Date()
	});
	
	// Hidden div
	$('.show_hide').click(function(){
		$(".slidingDiv").slideToggle();
		return false;
	});

	// Submit button
	$('#submitButton').button();
	
	// Validate search form
	$('#search_form').validate({
		debug: false,
		messages: {
			out_date: "Please select a valid date"
		},
		submitHandler: function(form) {
			form.submit();
		}
	});
}

function toggle() {
	var ele = document.getElementById("toggleText");
	var text = document.getElementById("displayText");
	if(ele.style.display == "block") {
    		ele.style.display = "none";
		text.innerHTML = "show";
  	}
	else {
		ele.style.display = "block";
		text.innerHTML = "hide";
	}
} 