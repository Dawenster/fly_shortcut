get '/' do
	@shortcuts = []

	all_itineraries = Itinerary.all
	all_itineraries.each do |itinerary|

		sim_flights = Flight.where('flight_no = ? AND
																departure_airport_id = ?',
																itinerary.flights.first.flight_no,
																itinerary.origin_airport_id)

		sim_flights.each do |flight|
			if flight.itinerary.price < itinerary.price
				@shortcuts << flight.itinerary
			end
		end
	end

	@shortcuts = @shortcuts.uniq.each_slice(2)

	puts "*" * 100
	puts @shortcuts.count

  erb :index
end
