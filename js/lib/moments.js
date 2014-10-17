(function() {
  var Moments;

  Moments = (function() {
    function Moments(options) {
      var _ref, _ref1, _ref10, _ref11, _ref12, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (options == null) {
        options = {};
      }
      this.url = (_ref = options.url) != null ? _ref : false;
      this.on = false;
      this.container = (_ref1 = options.container) != null ? _ref1 : $('.moments');
      this.triggers = (_ref2 = options.triggers) != null ? _ref2 : $('.moments-trigger');
      this.next_btn = (_ref3 = options.next) != null ? _ref3 : $('.moments-next');
      this.previous_btn = (_ref4 = options.previous) != null ? _ref4 : $('.moments-previous');
      this.close_btn = (_ref5 = options.close) != null ? _ref5 : $('.moments-close');
      this.menu_btn = (_ref6 = options.menu) != null ? _ref6 : $('.moments-menu');
      this.summary_container = (_ref7 = options.summary) != null ? _ref7 : $('.moments-summary');
      this.summary_content_container = (_ref8 = options.summary) != null ? _ref8 : $('.moments-summary-content');
      this.summary_close_btn = (_ref9 = options.summary_close) != null ? _ref9 : $('.moments-summary-close');
      this.active_container = (_ref10 = options.active) != null ? _ref10 : $('.moments-active');
      this.counter_container = (_ref11 = options.counter) != null ? _ref11 : $('.moments-counter');
      this.loading_container = (_ref12 = options.loading) != null ? _ref12 : $('.moments-loading');
      this.body = $('html, body');
      this.data = false;
      this.current_collection = false;
      this.current_collection_length = 0;
      this.current_photo = false;
      this.current_photo_index = 0;
      this.image_queue = false;
      this.init();
    }

    Moments.prototype.init = function() {
      console.log('Moments is initialized.');
      this.bindNavigationEvents();
      return this.load();
    };

    Moments.prototype.load = function() {
      return $.ajax({
        url: this.url,
        type: 'GET',
        success: (function(_this) {
          return function(data, status, jqXHR) {
            console.log('Success retrieving data.');
            _this.data = data;
            return _this.setup();
          };
        })(this),
        error: (function(_this) {
          return function(data) {
            return console.log('Error retrieving data.');
          };
        })(this)
      });
    };

    Moments.prototype.setup = function() {
      return this.triggers.on('click', (function(_this) {
        return function(e) {
          var _collection, _element;
          _element = $(e.target);
          _collection = _.findWhere(_this.data, {
            slug: _element.data('slug')
          });
          if (_collection) {
            console.log('Loaded collection: ', _collection);
            _this.current_collection = _collection;
            _this.current_collection_length = _collection.photos.length - 1;
            return _this.preload();
          }
        };
      })(this));
    };

    Moments.prototype.open = function(photo_index) {
      if (photo_index == null) {
        photo_index = 0;
      }
      this.current_photo = this.current_collection.photos[photo_index];
      this.active_container.css({
        'background-image': 'url(' + this.current_photo.source + ')'
      });
      return this.updateCounter();
    };

    Moments.prototype.bindNavigationEvents = function() {
      this.next_btn.on('click', (function(_this) {
        return function(e) {
          return _this.next();
        };
      })(this));
      this.previous_btn.on('click', (function(_this) {
        return function(e) {
          return _this.previous();
        };
      })(this));
      this.close_btn.on('click', (function(_this) {
        return function(e) {
          return _this.close();
        };
      })(this));
      this.menu_btn.on('click', (function(_this) {
        return function(e) {
          return _this.openMenu();
        };
      })(this));
      this.summary_close_btn.on('click', (function(_this) {
        return function(e) {
          return _this.closeSummary();
        };
      })(this));
      return this.keyboard();
    };

    Moments.prototype.preload = function() {
      var photo, _i, _len, _ref;
      this.image_queue = new createjs.LoadQueue(true);
      _ref = this.current_collection.photos;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        photo = _ref[_i];
        this.image_queue.loadFile(photo.source);
      }
      this.startLoading();
      this.image_queue.on("progress", function(e) {
        return this.updateProgress(e);
      }, this);
      return this.image_queue.on("complete", function(e) {
        this.open();
        return this.doneLoading();
      }, this);
    };

    Moments.prototype.startLoading = function() {
      return this.loading_container.show();
    };

    Moments.prototype.updateProgress = function(e) {
      var _percentage;
      _percentage = parseInt(e.loaded * 100);
      console.log(_percentage);
      return this.loading_container.find('span').text(_percentage.toString());
    };

    Moments.prototype.doneLoading = function() {
      this.loading_container.hide();
      this.container.addClass('on');
      this.body.addClass('moments-on');
      return this.on = true;
    };

    Moments.prototype.next = function() {
      if (!(this.current_collection_length <= this.current_photo_index)) {
        this.current_photo_index++;
        this.current_photo = this.current_collection.photos[this.current_photo_index];
        return this.open(this.current_photo_index);
      }
    };

    Moments.prototype.previous = function() {
      if (this.current_photo_index !== 0) {
        this.current_photo_index--;
        this.current_photo = this.current_collection.photos[this.current_photo_index];
        return this.open(this.current_photo_index);
      }
    };

    Moments.prototype.openMenu = function() {
      var _content;
      _content = $('<h2>' + this.current_collection.title + '<h2><p>' + this.current_collection.description + '</p>');
      this.summary_content_container.append(_content);
      this.summary_container.addClass('on');
      return e.preventDefault();
    };

    Moments.prototype.closeSummary = function() {
      this.summary_container.removeClass('on');
      return this.summary_content_container.empty();
    };

    Moments.prototype.close = function() {
      this.container.removeClass('on');
      this.on = false;
      this.body.removeClass('moments-on');
      return this.current_photo_index = 0;
    };

    Moments.prototype.updateCounter = function() {
      var _current, _total;
      _current = this.current_photo_index + 1;
      _total = this.current_collection_length + 1;
      return this.counter_container.text(_current + '/' + _total);
    };

    Moments.prototype.keyboard = function() {
      if (window.Mousetrap) {
        window.Mousetrap.bind('right', (function(_this) {
          return function() {
            return _this.next();
          };
        })(this));
        window.Mousetrap.bind('left', (function(_this) {
          return function() {
            return _this.previous();
          };
        })(this));
        window.Mousetrap.bind('esc', (function(_this) {
          return function() {
            if (_this.summary_container.hasClass('on')) {
              return _this.closeSummary();
            } else {
              return _this.close();
            }
          };
        })(this));
        return window.Mousetrap.bind('i', (function(_this) {
          return function() {
            return _this.openMenu();
          };
        })(this));
      }
    };

    return Moments;

  })();

  window.Moments = Moments;

}).call(this);
