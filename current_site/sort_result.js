/*
* Global variable - duplicate entry array
*/
var duplicate = {};

/*
* Global variable - main entry array
*/
var main = {rows:new LinkedList.Circular(),sortByPrice:true,sortByFare:false,sortByAirline:false};

/*
* Main sorting method
*/
function sortDefault( data )
{
	// Lowest price array
	var lowestPrice = {};
	
	// Setup Main
	main.format_origin = data.origin;
	main.format_destination = data.destination;
	main.format_date = data.date;
	main.real = data.real_dest;
	
	if ( jQuery.isEmptyObject(data.result1) || jQuery.isEmptyObject(data.result2) )
	{
		return null;
	}
	
	main.origin = data.result2.solutionList.solutions[0].itinerary.slices[0].origin;
	main.destination = data.result2.solutionList.solutions[0].itinerary.slices[0].destination;
	main.date = data.result2.solutionList.solutions[0].itinerary.slices[0].departure;
	
	// capture direct flight prices
	var tmpRes = data.result2.solutionList.solutions;
	for(var i in tmpRes)
	{
		var total = tmpRes[i].displayTotal.substring(3);
		var format_total = parseFloat(total);
		
		var flightCode = tmpRes[i].itinerary.slices[0].flights[0];
		if( flightCode in lowestPrice )
		{
			// If duplicate, capture lowest price
			if ( format_total < lowestPrice[flightCode] )
			{
				lowestPrice[flightCode] = format_total;
			}
		}
		else
		{
			lowestPrice[flightCode] = format_total;
		}
	}

	// Combine both arrays
	if ( jQuery.isEmptyObject(data.result1.solutionList.solutions) || jQuery.isEmptyObject(data.result2.solutionList.solutions) )
	{
		return null;
	}
	var c1 = 0;
	var c2 = 0;
	var tmpRes1 = data.result1.solutionList.solutions;
	var tmpRes2 = data.result2.solutionList.solutions;
	while( !jQuery.isEmptyObject( tmpRes1[c1] ) || !jQuery.isEmptyObject( tmpRes2[c2] ) )
	{
		var solution;

		if ( jQuery.isEmptyObject( tmpRes1[c1] ) )
		{
			solution = tmpRes2[c2];
			solution['isAirbitrage'] = false;
			c2++;
		}
		// if second array null, set solution to first array
		else if ( jQuery.isEmptyObject( tmpRes2[c2] ) )
		{
			solution = tmpRes1[c1];
			solution['isAirbitrage'] = true;
			c1++;
		}
		// if both arrays are not null, compare
		else
		{
			var total1 = tmpRes1[c1].displayTotal.substring(3);
			var total2 = tmpRes2[c2].displayTotal.substring(3);
			var format_total1 = parseFloat(total1);
			var format_total2 = parseFloat(total2);

			if ( format_total1 <= format_total2 )
			{
				solution = tmpRes1[c1];
				c1++;

				solution['isAirbitrage'] = true;
			}
			else
			{
				solution = tmpRes2[c2];
				c2++;
				solution['isAirbitrage'] = false;
			}
		}

		// Check for duplicates and store savings
		var tmpSlice = solution.itinerary.slices[0];
		if ( jQuery.isEmptyObject( duplicate[tmpSlice.flights[0]] ) )
		{
			if ( solution['isAirbitrage'] )
			{
				var tmpTotal = parseFloat(solution.displayTotal.substring(3));
				if ( tmpSlice.flights[0] in lowestPrice && tmpTotal < lowestPrice[tmpSlice.flights[0]] )
				{
					var save = lowestPrice[tmpSlice.flights[0]] - tmpTotal;
					solution.itinerary.slices[0].fare_saving = "Shortcut</br><b>SAVE $" + save.toFixed(2) + "!</b>";
				}
				else
				{
					solution.itinerary.slices[0].fare_saving = "Additional flight";
				}
			}
			else
			{
				solution.itinerary.slices[0].fare_saving = "Original";
			}
			
			// Save duplicate
			duplicate[tmpSlice.flights[0]] = solution;
			solution.detailReady = false;
			
			// Query details
			if ( solution['isAirbitrage'] )
			{
				$.post("http://www.flyshortcut.com/wp-content/themes/journalcrunch/process_detail.php",
				{ solution_set: data.result1.solutionSet, session: data.result1.session, solution: solution.id },
				function(detail){
					// Store details in original array
					if ( !jQuery.isEmptyObject(detail.result) )
					{
						// Update Arrival Time
						var tmpID = "#" + detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].carrier.code + detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].flight.number + "_arrival";
						$(tmpID).html("");
						var tmpArrival = to12HrString(detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].legs[0].arrival);
						var date_diff = diffDate(detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].legs[0].departure.substring(0,10), detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].legs[0].arrival.substring(0,10));
						if ( date_diff > 0 )
						{
							tmpArrival = tmpArrival + "</br>+" + date_diff + " day";
						}
						$(tmpID).html(tmpArrival);
						$(tmpID).attr('sorttable_customkey',DateToCustomKey(detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].legs[0].arrival));
						duplicate[detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].carrier.code + detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].flight.number].itinerary.slices[0].arrival = detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].legs[0].arrival;
						
						// Update Duration
						var tmpID = "#" + detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].carrier.code + detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].flight.number + "_duration";
						$(tmpID).html("");
						var duration = detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].legs[0].duration;
						$(tmpID).html((duration/60).toFixed(0) + "h " + duration%60 + "m");
						duplicate[detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].carrier.code + detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].flight.number].itinerary.slices[0].duration = detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].legs[0].duration;

						// Detail ready
						duplicate[detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].carrier.code + detail.result.itineraryInlineDetails.itinerary.slices[0].segments[0].flight.number].detailReady = true;
					}
				}, "json");
			}
		}
		else
		{
			delete solution;
			continue;
		}
		
		// insert into array
		main.rows.append(new LinkedList.Node(solution));
	}
}

/*
* Main content update method
*/
function updateContent()
{
	//console.log(main);
	$('#search_result').html("");
	
	// Form top search
	var top_search = "";
	top_search = top_search + "<form id='top_search_form' action='http://www.flyshortcut.com/search' method='POST' name='top_search_form'>";
	top_search = top_search + "<table border='0' cellspacing='10'><tr>";
	top_search = top_search + "<td><label id='search_from_label' for='search_from'>From</label></td>";
	top_search = top_search + "<td><input type='text' name='search_from' id='search_from' size='30' value='" + main.format_origin + "'/></td>";
	top_search = top_search + "<td><label id='search_dest_label' for='search_dest'>To</label></td>";
	top_search = top_search + "<td><input type='text' name='search_dest' id='search_dest' size='30' value='" + main.format_destination + "'/></td>";
	top_search = top_search + "<td><label id='out_date_label' for='out_date'>Depart</label></td>";
	top_search = top_search + "<td><input type='text' name='out_date' id='datepicker' size='30' value='" + main.format_date + "' class='required'/></td>";
	top_search = top_search + "<td><input type='submit' id='submitButton' name='submitButton' value='Search' class='ui-btn-hidden' aria-disabled='false'/></td>";
	top_search = top_search + "</tr></table></form>";
	$('#search_result').append(top_search);

	// Check input
	checkInput();
	
	// Check to make sure results available
	if ( jQuery.isEmptyObject( main.rows.first ) )
	{
		$('#search_result').append("<div style='padding:100px'><center><h3>No matching flights found! Please refine your search.</h3></center></div>");
	}
	else
	{
		// Display Search parameters
		var search_date = new Date(main.date);
		$('#search_result').append("</br><div id='search_header'>One Way : " + main.origin.name + " (" + main.origin.code + ")" + "   to   " + main.destination.name + " (" + main.destination.code + ")<br/>Date : " + search_date.toLocaleDateString() + "</div>");

		// Display real destinations
		//$('#search_result').append("<div id='search_real_dest'>Actual Destinations : " + main.real + "</div>");
	
		$('#search_result').append("<table border='1' id='search_table' class='sortable'>");
		$('#search_table').append("<thead><tr><th class='sorttable_nosort'>Book</th><th class='sort'>Price</th><th class='sort'>Fare Type</th><th class='sort'>Airline</th><th class='sort'>Departure</th><th class='sort'>Arrival</th><th class='sorttable_nosort'>Stops</th></tr></thead>");
		$('#search_table').append("<tbody id='search_table_body'></tbody>");
	
		var row = main.rows.first;
		do
		{
			var slice = row.data.itinerary.slices[0];
			
			var content_row = "<tr>";
			
			var buttonID = slice.flights[0] + "_button";
			var dialogID = slice.flights[0] + "_dialog";
			content_row = content_row + "<td><button id='" + buttonID + "' class='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only' role='button' aria-disabled='false'><span class='ui-button-text'>Book</span><div id='"+dialogID+"' class='jdialog' style='display:none;'></div></button></td>";
			content_row = content_row + "<td sorttable_customkey='" + row.data.displayTotal.substring(3) +"'>" + row.data.displayTotal + "</td>";
			content_row = content_row + "<td>" + slice.fare_saving +"</td>";
			content_row = content_row + "<td valign='top'>";
			
			var flights = slice.flights;
			for(var k in flights)
			{
				var carriers = row.data.itinerary.carriers;
				for ( var l in carriers )
				{
					if ( flights[k].indexOf(carriers[l].code) != -1 )
					{
						content_row = content_row + "<img width='35' height='35' src='http://www.gstatic.com/flights/airline_logos/35px/" + carriers[l].code + ".png'> ";
						content_row = content_row + carriers[l].shortName;
					}
				}
				content_row = content_row + " "+flights[k];

				// If airbitrage, omit actual destination flight
				if ( row.data.isAirbitrage )
				{
					break;
				}
				content_row = content_row + "<br/>";
			}
			content_row = content_row + "</td>";

			// Parse and display departure
			content_row = content_row + "<td sorttable_customkey='" + DateToCustomKey(slice.departure) +"'>" + to12HrString(slice.departure) + "</td>";

			// Parse and display arrival
			if ( !row.data.isAirbitrage )
			{
				var tmpArrival = to12HrString(slice.arrival);
				var date_diff = diffDate(slice.departure.substring(0,10), slice.arrival.substring(0,10));
				if ( date_diff > 0 )
				{
					tmpArrival = tmpArrival + "</br>+" + date_diff + " day";
				}
				content_row = content_row + "<td sorttable_customkey='" + DateToCustomKey(slice.arrival) +"'>" + tmpArrival + "</td>";
			}
			else
			{
				if ( row.data.detailReady )
				{
					var tmpArrival = to12HrString(slice.arrival);
					var date_diff = diffDate(slice.departure.substring(0,10), slice.arrival.substring(0,10));
					if ( date_diff > 0 )
					{
						tmpArrival = tmpArrival + "</br>+" + date_diff + " day";
					}
					content_row = content_row + "<td sorttable_customkey='" + DateToCustomKey(slice.arrival) +"'>" + tmpArrival + "</td>";
				}
				else
				{
					content_row = content_row + "<td id='"+ slice.flights[0] + "_arrival'>Loading" + "</td>";
				}
			}

			// Parse and display stops
			content_row = content_row + "<td>";
			if ( !row.data.isAirbitrage )
			{
				if ( !jQuery.isEmptyObject( slice.stops ) )
				{
					var stops = slice.stops;
					for( var m in stops )
					{
						content_row = content_row + "<span title='" + stops[m].name + "'>" + stops[m].code + "</span><br/>";
					}
				}
			}
			content_row = content_row + "</td>";
			content_row = content_row + "</tr>";
			$('#search_table_body').append(content_row);
		
			// Setup warning
			
			$('#'+dialogID).append("<h3></br></h3>");
			$('#'+dialogID).append("<h3>Step 1: Go to Travelocity</h3>");
			$('#'+dialogID).append("<p>Click the below link to Travelocity.  We are affiliated with this trusted website to sell you shortcut flights.</p>");
						
			// Setup airline search links
			var depart_date = new Date(slice.departure);
			var format_depart_date = ('0' + (depart_date.getMonth()+1)).slice(-2) + '/' + ('0' + depart_date.getDate()).slice(-2) + '/' + depart_date.getFullYear();
			
			// Setup Flight Network
			// DW Nov. 5, 2012
			// Commented out because I don't think we will get revenue unless we use the link that CJ provides
			
			// var flightNetwork = "http://www.flightnetwork.com/flights/search?client_ref=CJU&currency=CAD&CJPID=5835159";
			// flightNetwork = flightNetwork + "&gateway_dep=" + slice.origin.code;
			// flightNetwork = flightNetwork + "&cls=0&utm_medium=affiliate";
			// flightNetwork = flightNetwork + "&depart_date=" + format_depart_date;
			// flightNetwork = flightNetwork + "&child=0&trip_type=0&infant=0&adult=1&utm_source=CJ";
			// flightNetwork = flightNetwork + "&gateway_ret=" + slice.destination.code;
			
			// Setup Travelocity
			
			// Cheap O Air
			// DW Nov. 5, 2012
			// Commented out because I don't think we will get revenue unless we use the link that CJ provides
			
			// var encodePart = "http://www.cheapoair.com/Default.aspx?tabid=1832&t=f&from=" + slice.origin.code;
			// encodePart = encodePart + "&fromDt=" + format_depart_date;
			// encodePart = encodePart + "&fromTm=1100";
			// encodePart = encodePart + "&to=" + slice.destination.code;
			// encodePart = encodePart + "&rt=false&ad=1&se=0&ch=0&class=1&infl=0&infs=0&airpref=&preftyp=&issearchflexible=true&IsNS=false&IsAltApt=true";
			
			// var cheapoair = "http://www.cheapoair.com/providers/CommissionJunctionHandler.aspx?FpAffiliate=CJ&target=";
			// cheapoair = cheapoair + encodeURIComponent(encodePart);
			// cheapoair = cheapoair + "&PID=5835159&AID=10948911&CJSID=";
			
			// DW Nov. 1, 2012
			// Commented out all direct search functionality (including Travelocity) since it may not give us revenue
			
			// Travelocity:
			// $('#'+dialogID).append("<p><table><tr><td id='affiliates' width='200'><a href='http://www.tkqlhce.com/click-5835159-10415728' target='_top'><img src='http://www.ftjcfx.com/image-5835159-10415728' width='150' height='50' alt='Travelocity.ca -- great deals on flights & more' border='0'/></a></td></tr></table></p>");
			
			// Flight Network
			// $('#'+dialogID).append("<p><table><tr><td id='affiliates' width='200'><a href='" + flightNetwork + "' target='_blank'><img src='http://www.lduhtrp.net/image-5835159-10801139' width='120' height='60' alt='Flightnetwork.com -Specializing in Cheap Flights ' border='0' align='middle'/></a></td></tr></table></p>");
			
			// CheapOair:
			// $('#affiliates').append("<td width='200'><a href='" + cheapoair + "' target='_blank'><img src='http://www.lduhtrp.net/image-5835159-10594974' width='120' height='60' alt='Logo 120x60 CheapOair' border='0' align='middle'/></a></td>");
			
			// Will use a simple link version as opposed to the complex deep link created above
			$('#'+dialogID).append("<p><table><tr><td id='affiliates' width='200'><a href='http://www.tkqlhce.com/click-5835159-10415728' target='_blank'><img src='http://www.ftjcfx.com/image-5835159-10415728' width='150' height='50' alt='Travelocity.ca -- great deals on flights & more' border='0' align='middle'/></a></td></tr></table></p>");
			
			
			$('#'+dialogID).append("<h3>Step 2: Search</h3>");
			$('#'+dialogID).append("<p>A) Select to search <u>one-way flights</u></br>B) Put <u>"+ slice.origin.name  + "</u> in the 'From' field</br>C) Put <u>"+ slice.destination.name  + "</u> in the 'To' field</br>D) Enter <u>"+ format_depart_date +"</u> as your desired departure date</br>E) Hit 'Search'!</p>");
			
			$('#'+dialogID).append("<h3>Step 3: Find and buy</h3>");
			$('#'+dialogID).append("<p>A) Find your flight that connects at <u>"+ main.destination.name  + "</u></br>B) Follow Travelocity's instructions to purchase the ticket</p>");
			
			$('#'+dialogID).append("<h3>That's it!  Have a good flight! :)</br> </h3>");
			$('#'+dialogID).append("</br> ");
			
			// Notes after the affiliate logos
			$('#'+dialogID).append("<p><i><u>Note</u>: Shortcut flights are pretty awesome on savings, but airlines sometimes make it difficult for us. Be sure you read our <a href='http://www.flyshortcut.com/risks/' target='_blank'>risks page</a> before you take off!</i></p>");
			
	
			// Make JQuery button
			$("#"+buttonID).button();
			
			// Add button click
			$('#'+buttonID).each(function() {
				$.data(this, 'dialog', 
					$('.jdialog', $(this)).dialog({
						autoOpen: false,
						open: function(){
							$('.flora.ui-dialog').css({position:"fixed"});
						},
						close: function(){
							$(".ui-widget-overlay").remove();
						},
						dialogClass: "flora",
						resizable: false,
						draggable: false,
						minWidth: 700,
						title: "Here's what you need to know"
					})
				);
			}).click(function() {
				$("#mainWrapper").append("<div class='ui-widget-overlay'></div>");
				jQuery('.ui-widget-overlay').bind('click', $.proxy(function () {
					//use original 'this'
					$.data(this, 'dialog').dialog('close');
					$(".ui-widget-overlay").remove();
				},this));
				
				$.data(this, 'dialog').dialog('open');
				return false;
			});  
			
			// Move pointer to next row
			row = row.next;
		}
		while ( row != main.rows.first )

		// Make table sortable
		sorttable.makeSortable(document.getElementById('search_table'));
	}
}

function DateToCustomKey(date)
{
	var jDate = new Date(date);
	var key = jDate.getFullYear() + ('0' + (jDate.getMonth()+1)).slice(-2) + ('0' + jDate.getDate()).slice(-2) + ('0' + jDate.getHours()).slice(-2) + ('0' + jDate.getMinutes()).slice(-2) + '00';
	return key;
}

function to12HrString(date)
{
	var jDate = new Date(date);
	var time;
	var hour = jDate.getHours();
	var min = jDate.getMinutes();

	if ( hour > 12  )
	{
		hour = hour - 12;
		time = hour + ":" + ('0' + min).slice(-2) + " pm ";
	}
	else
	{
		time = hour + ":" + ('0' + min).slice(-2) + " am ";
	}

	return time;
}

function diffDate(depart, arrival)
{
	var one_day=1000*60*60*24
	var date1 = new Date(depart);
	var date2 = new Date(arrival);

	return Math.ceil((date2.getTime()-date1.getTime())/(one_day));
}