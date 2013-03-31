class Flight < ActiveRecord::Base
	belongs_to 	:itinerary

	belongs_to 	:airport,
							:class_name => Airport,
							:foreign_key => 'departure_airport_id'

	belongs_to 	:airport,
							:class_name => Airport,
							:foreign_key => 'arrival_airport_id'

end
