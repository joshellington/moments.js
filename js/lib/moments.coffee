# Moments.js
# A simple gallery plugin

class Moments
  constructor: (options={}) ->
    @url = options.url ? false
    @on = false
    @container = options.container ? $('.moments')
    @triggers = options.triggers ? $('.moments-trigger')
    @next_btn = options.next ? $('.moments-next')
    @previous_btn = options.previous ? $('.moments-previous')
    @close_btn = options.close ? $('.moments-close')
    @menu_btn = options.menu ? $('.moments-menu')
    @summary_container = options.summary ? $('.moments-summary')
    @summary_content_container = options.summary ? $('.moments-summary-content')
    @summary_close_btn = options.summary_close ? $('.moments-summary-close')
    @active_container = options.active ? $('.moments-active')
    @counter_container = options.counter ? $('.moments-counter')
    @loading_container = options.loading ? $('.moments-loading')
    @body = $('html, body')
    
    @data = false
    @current_collection = false
    @current_collection_length = 0
    @current_photo = false
    @current_photo_index = 0
    @image_queue = false

    @init()

  init: ->
    console.log 'Moments is initialized.'
    @bindNavigationEvents()
    @load()

  load: ->
    $.ajax
      url: @url
      type: 'GET'
      success: (data, status, jqXHR) =>
        console.log 'Success retrieving data.'
        @data = data
        @setup()
      error: (data) =>
        console.log 'Error retrieving data.'

  setup: ->
    @triggers.on 'click', (e) =>
      _element = $(e.target)
      _collection = _.findWhere @data, { slug: _element.data('slug') }

      if _collection
        console.log 'Loaded collection: ', _collection
        @current_collection = _collection
        @current_collection_length = _collection.photos.length - 1
        @preload()

  open: (photo_index = 0) ->
    @current_photo = @current_collection.photos[photo_index]
    @active_container.css
      'background-image': 'url(' + @current_photo.source + ')'
    @updateCounter()

  bindNavigationEvents: ->
    @next_btn.on 'click', (e) =>
      @next()
    
    @previous_btn.on 'click', (e) =>
      @previous()
    
    @close_btn.on 'click', (e) =>
      @close()
    
    @menu_btn.on 'click', (e) =>
      @openMenu()

    @summary_close_btn.on 'click', (e) =>
      @closeSummary()
    
    @keyboard()

  preload: ->
    @image_queue = new createjs.LoadQueue(true)

    for photo in @current_collection.photos
      @image_queue.loadFile(photo.source)

    @startLoading()

    # @image_queue.on "loadstart", (e) ->
    # , @

    @image_queue.on "progress", (e) ->
      # console.log e
      @updateProgress(e)
    , @

    @image_queue.on "complete", (e) ->
      # console.log e
      @open()
      @doneLoading()
    , @

  startLoading: ->
    @loading_container.show()

  updateProgress: (e) ->
    # @loading_container.show()
    _percentage = parseInt(e.loaded * 100)
    console.log _percentage
    @loading_container.find('span').text(_percentage.toString())

  doneLoading: ->
    @loading_container.hide()
    @container.addClass('on')
    @body.addClass('moments-on')
    @on = true

  next: ->
    unless @current_collection_length <= @current_photo_index
      @current_photo_index++
      @current_photo = @current_collection.photos[@current_photo_index]
      @open(@current_photo_index)

  previous: ->
    unless @current_photo_index is 0
      @current_photo_index--
      @current_photo = @current_collection.photos[@current_photo_index]
      @open(@current_photo_index)

  openMenu: ->
    _content = $('<h2>'+@current_collection.title+'<h2><p>'+@current_collection.description+'</p>')
    @summary_content_container.append(_content)
    @summary_container.addClass('on')
    e.preventDefault()

  closeSummary: ->
    @summary_container.removeClass('on')
    @summary_content_container.empty()

  close: ->
    @container.removeClass('on')
    @on = false
    @body.removeClass('moments-on')
    @current_photo_index = 0

  updateCounter: ->
    _current = @current_photo_index + 1
    _total = @current_collection_length + 1
    
    @counter_container.text(_current + '/' + _total)

  keyboard: ->
    if window.Mousetrap
      window.Mousetrap.bind 'right', =>
        @next()
      
      window.Mousetrap.bind 'left', =>
        @previous()
      
      window.Mousetrap.bind 'esc', =>
        if @summary_container.hasClass('on')
          @closeSummary()
        else
          @close()

      window.Mousetrap.bind 'i', =>
        @openMenu()

window.Moments = Moments