get '/' do
	shortcuts = get_shortcuts.uniq
	@flights = []

	shortcuts.each do |shortcut|
		shortcut.flights.each do |flight|
			if flight.departure_airport_id == shortcut.origin_airport_id
				@flights << flight
			end
		end	
	end
  erb :index
end

post '/:filter' do 
	@shortcuts = get_shortcuts(params['origin'], params['destination'], params['date'])
	erb :index
end