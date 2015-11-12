# jQuery.dpnAutocomplete

A simple jQuery autocomplete

## Options:

- ajax: Ajax settings (can be a function which gets the current input)
- categories: Optional categories to sort results (a category label has the name and a label)
- minChars: minimum characters to type before execute the ajax request
- autocompleteId: the id of the autocomplete container
- autocompleteClasses: the classes of the autocomplete container (as string)
- itemListCallback: list callback to build the html list items
- clickCallback: click callback for listitems (gets the event and the item)
- hoverCallback: hover callback for listitems (gets the event and the item)
 
## Usage example:
```JavaScript
'use strict';

(function ($) {
	$('#destination').dpnAutocomplete({
		categories: [
			{
				label: 'Country',
				name: 'country'
			}, {
				label: 'Region',
				name: 'region'
			}, {
				label: 'Location',
				name: 'location'
			}
		],
		ajax: function(input) {
			return {
				type: 'POST',
				url: '/destinations',
				data: {
					'destination': input
				},
				dataType: 'json'
			};
		},
		itemListCallback: function(item, category) {
			return '<li class="' + category.name + ' item"><a href="item.link" title="category.label">' + item.name + '</a></li>';
		}
	});
})(jQuery);
```