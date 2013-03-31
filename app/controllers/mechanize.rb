# Capybara.default_driver = :webkit

# class Scraper
#   include Capybara::DSL

#   def fill_in_form
#     visit('http://matrix.itasoftware.com/')
#     find('#ita_layout_TabContainer_0_tablist_ita_form_SliceForm_1 .tabLabel').click
#     fill_in 'advancedfrom1', with: 'SFO'
#     find('li', :text => 'SFO').click
#     fill_in 'advancedto1', with: 'BOS'
#     find('li', :text => 'BOS').click
#     fill_in 'ita_form_date_DateTextBox_1', with: '03/28/2013'
#     using_wait_time(30) do
#       find('#advanced_searchSubmitButton_label').click
#       find_link("All flights")
#     end
#     all('#solutionList .dijitReset').each do |row|
#       row.click
#       row.reload
#       row.click_link('Details')
#     end
#     save_screenshot('screenshot.png')
#   end
# end

# Scraper.new.fill_in_form
