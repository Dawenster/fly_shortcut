get '/' do
	@shortcuts = get_shortcuts.uniq
  erb :index
end

post '/:filter' do 
	@shortcuts = get_shortcuts(params['origin'], params['destination'], params['date'])
	erb :index
end