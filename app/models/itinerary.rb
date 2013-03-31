class Itinerary < ActiveRecord::Base
	has_many 		:flights

	belongs_to 	:airport,
							:class_name => Airport,
							:foreign_key => 'origin_airport_id'

	belongs_to 	:airport,
							:class_name => Airport,
							:foreign_key => 'destination_airport_id'
end
