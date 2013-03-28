class Flight < ActiveRecord::Base
	belongs_to 	:itineraries

	belongs_to 	:airports,
							:class_name => Airport,
							:foreign_key => 'departure_airport_id'

	belongs_to 	:airports,
							:class_name => Airport,
							:foreign_key => 'arrival_airport_id'

end
