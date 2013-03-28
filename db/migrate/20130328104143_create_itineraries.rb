class CreateItineraries < ActiveRecord::Migration
  def change
  	create_table :itineraries do |t|
  		t.datetime	:date
  		t.integer 	:price
  		t.integer 	:origin_airport_id
  		t.integer 	:destination_airport_id

  		t.timestamps
  	end
  end
end
