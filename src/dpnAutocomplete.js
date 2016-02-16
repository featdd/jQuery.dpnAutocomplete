'use strict';

(function($, window, document, undefined) {
  var pluginName = 'dpnAutocomplete',
    defaults = {
      ajax: {},
      categories: [],
      minChars: 3,
      autocompleteClass: 'dpn-autocomplete',
      itemListCallback: function(item, category) {
        if (typeof category === 'undefined') {
          return '<li class="item">' + item + '</li>';
        } else {
          return '<li class="' + category.name + ' item">' + item + '</li>';
        }
      },
      clickCallback: null,
      hoverCallback: null
    };

  function Plugin(element, options) {
    this.element = element;
    this.settings = $.extend({}, defaults, options);
    this.init();
  }

  $.extend(Plugin.prototype, {
    $element: {},
    $autocomplete: {},
    init: function() {
      this.$element = $(this.element);

      this.initDropdown();
      this.initEvents();
    },
    initDropdown: function() {
      var html = '<div class="' + this.settings.autocompleteClass + '" style="display: none;"><ul>';

      $(this.settings.categories).each(function() {
        var category = this;

        html += '<li class="category ' + category.name + '" style="display: none;">' + category.label + '</li>';
      });

      html += '</ul></div>';

      $(this.element).after($(html));
      this.$autocomplete = $(this.element).next('.' + this.settings.autocompleteClass);
    },
    initEvents: function() {
      var that = this;
      var $list = this.$autocomplete.find('ul');
      var $selectedItem, $listItems, $lastItem, $firstItem = {};

      /*
       * input event
       *
       * executes ajax request or close autocomplete if
       * input is to small
       */
      $(this.element).on('input', function() {
        if (that.settings.minChars <= $(this).val().length) {
          that.execAjaxRequest($(this).val());
        } else {
          that.closeAutocomplete();
        }
      });

      /*
       * focus event
       *
       * when element gets focus and has enough input
       * the autocomplete should be reopened
       */
      $(this.element).on('focus', function() {
        if (that.settings.minChars <= $(this).val().length) {
          that.execAjaxRequest($(this).val());
        }
      });

      /*
       * focusout event
       *
       * when element loses the focus autocomplete
       * should be closed
       */
      $(this.element).on('focusout', function() {
        if (false === that.$autocomplete.is(':hover') && false === that.$element.is(':hover')) {
          that.closeAutocomplete();
        }
      });

      /*
       * click event
       *
       * executes the click callback when click
       * an item if callback is defined
       */
      $list.on('click', 'li.item', function(event) {
        if (typeof that.settings.clickCallback === 'function') {
          that.settings.clickCallback(event, this, that.$element);
        }

        that.closeAutocomplete();
      });

      /*
       * mouseover event
       *
       * adds selected class to elementes hovered
       * by the mouse and removes from other item
       */
      $list.on('mouseover', 'li.item', function(event) {
        $selectedItem = $(this);

        $list.find('li.selected').removeClass('selected');
        $selectedItem.addClass('selected');

        if (typeof that.settings.hoverCallback === 'function') {
          that.settings.hoverCallback(event, this);
        }
      });

      /*
       * keydown event
       *
       * catches several keys if autocomplete is shown
       *  - Enter: simulate click on item
       *  - Escape: closes the autocomplete
       *  - Arrow up/down: navigates threw the items
       */
      $(this.element).on('keydown', function(event) {
        if (false === that.$autocomplete.is(':hidden')) {
          $listItems = that.$autocomplete.find('ul li.item');
          $selectedItem = $list.find('li.selected');
          $firstItem = $listItems.first();
          $lastItem = $listItems.last();

          /*
           * Prevent cursor or screen from moving when using arrow keys
           * and prevent browser sending the form when pushing the enter key
           */
          if (event.which === 38 || event.which === 40 || event.which === 13) {
            event.preventDefault();
          }

          // escape
          if (event.which === 27) {
            that.closeAutocomplete();
          }

          // enter
          if (event.which === 13) {
            if (0 <= $selectedItem.length) {
              $selectedItem.trigger('click');
            }
          }

          // arrow up
          if (event.which === 38) {
            if ($selectedItem.length === 0) {
              $lastItem.addClass('selected');
            } else if ($selectedItem[0] !== $firstItem[0]) {
              $selectedItem.removeClass('selected');
              $selectedItem = $selectedItem.prevAll('li.item:first');
              $selectedItem.addClass('selected');
            }
          }

          // arrow down
          if (event.which === 40) {
            if ($selectedItem.length === 0) {
              $firstItem.addClass('selected');
            } else if ($selectedItem[0] !== $lastItem[0]) {
              $selectedItem.removeClass('selected');
              $selectedItem = $selectedItem.nextAll('li.item:first');
              $selectedItem.addClass('selected');
            }
          }
        }
      });
    },
    execAjaxRequest: function(input) {
      var that = this;

      // get ajax settings and fetch data on success
      $.ajax(this.getAjaxSettings(input)).success(function(data) {
        that.addSelections(data);
      });
    },
    getAjaxSettings: function(input) {
      // check if ajax settings is a callback and expects the input
      if (typeof this.settings.ajax === 'function') {
        return this.settings.ajax(input);
      } else {
        return this.settings.ajax;
      }
    },
    addSelections: function(data) {
      var that = this;
      var categories = this.settings.categories.length;
      var category, $list = {};

      // clear list before adding new items
      this.clearAutocomplete();

      // check if there are categories
      if (0 === this.settings.categories.length) {
        $list = that.$autocomplete.find('ul');

        if ($(data).length > 0) {
          that.$autocomplete.show();
        } else {
          that.closeAutocomplete();
        }

        $(data).each(function() {
          $list.append(that.settings.itemListCallback(this));
        });
      } else {
        $(this.settings.categories).each(function() {
          category = this;

          if (data.hasOwnProperty(category.name)) {
            $list = that.$autocomplete.find('ul li.' + category.name);

            // show autocomplete or count down available categories
            if (data[category.name].length > 0) {
              $list.show();
              that.$autocomplete.show();
            } else {
              categories--;
            }

            /*
             * hide autocomplete if no categories ar available
             * else call the listitem callback
             */
            if (0 === categories) {
              that.closeAutocomplete();
            } else {
              $(data[category.name]).each(function() {
                $list.after(that.settings.itemListCallback(this, category));
              });
            }
          }
        });
      }
    },
    closeAutocomplete: function() {
      this.$autocomplete.hide();
      this.clearAutocomplete();
    },
    clearAutocomplete: function() {
      var $autocomListItems = this.$autocomplete.find('ul li');

      $autocomListItems.remove('.item');

      $autocomListItems.each(function() {
        $(this).hide();
      });
    }
  });

  $.fn[pluginName] = function(options) {
    this.each(function() {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
      }
    });
    return this;
  };

})(jQuery, window, document);
