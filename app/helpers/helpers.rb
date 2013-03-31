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

			sim_flights = Flight.where('flight_no = ? AND
																	departure_airport_id = ?',
																	itinerary.flights.first.flight_no,
																	itinerary.origin_airport_id)

			sim_flights.each do |flight|
				if flight.itinerary.price < itinerary.price && flight.itinerary.flights.count > 1
					
					shortcuts << flight.itinerary
				end
			end
		end
		shortcuts
	end
end