helpers do
	def get_shortcuts
		# origin_id = Airport.find_by_name(origin).id
		# destination_id = Airport.find_by_name(destination).id

		# all_itineraries = Itinerary.where(:origin_airport_id => origin_id,
		# 																:destination_airport_id => destination_id,
		# 																:date => date)
		shortcuts = []
		all_itineraries = Itinerary.all
		all_itineraries.each do |itinerary|
			
			if itinerary.flights.count > 1
				first_flight = ""
				if itinerary.flights[0].departure_time > itinerary.flights[1].departure_time
					first_flight = itinerary.flights[1]
				else
					first_flight = itinerary.flights[0]
				end

				sim_flights = Flight.where('flight_no = ? AND
																		departure_time = ?',
																		first_flight.flight_no,
																		first_flight.departure_time)

			sim_flights.each do |flight|
				puts '*' * 100
				puts itinerary.price
				puts flight.itinerary.price
				puts flight.itinerary.flights.count
				if flight.itinerary.price > itinerary.price
					itinerary.update_attributes(:original_price => flight.itinerary.price)
					shortcuts << itinerary
					puts shortcuts
				end
			end
		end
	end
	shortcuts
end
end