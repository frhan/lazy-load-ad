(function ($) {
  $.lazyLoadAdRunning = false;
  $.lazyLoadAdTimers = [];

  $.fn.lazyLoadAd = function (options) {
    //alert("Hello");
    var settings = {
      threshold: 0,
      failurelimit: 1,
      forceLoad: false,
      event: "scroll",
      viewport: window,
      placeholder: false,
      // Can specify a picture to replace media while loading
      onLoad: false,
      onComplete: false,
      timeout: 1500
    };

    if (options) {
      $.extend(settings, options);
    }
    //console.log(settings);

    var elements = this;
    $(settings.viewport).bind("checkLazyLoadAd", function () {
      var counter = 0;
      elements.each(function () {
        if ($.lazyLoadAdRunning) {
          if ($.lazyLoadAdTimers.runTimeOut) {
            clearTimeout($.lazyLoadAdTimers.runTimeOut);
          }

          $.lazyLoadAdTimers.runTimeOut = setTimeout(function () {
            $(settings.viewport).trigger("checkLazyLoadAd");
          }, 300);
          return false;
        } else if (settings.forceLoad === true) {
          $(this).trigger("load");
        } else if (!$.belowthefold(this, settings) && !$.abovethetop(this, settings)) {
          $(this).trigger("load");
        } else {
          if (counter++ > settings.failurelimit) {
            return false;
          }
        }
      });

      /* Remove element from array so it is not looped next time. */
      var temp = $.grep(elements, function (element) {
        return !(($(element).data('loaded') === 'true') ? true : false);
      });
      elements = $(temp);
    });

    if ("scroll" === settings.event) {
      $(settings.viewport).bind("scroll", function (event) {
        if (elements.length === 0) {
          return false;
        }

        $(settings.viewport).trigger("checkLazyLoadAd");
      });
    }

    this.each(function (_index, _value) {
        var self = $(this);

        /* Test if element is loaded */
        self.isLoaded = function () {
            return ((self.data('loaded') === 'true') ? true : false);
        };

        self.one('onComplete', function () {

        });

        self.one("load", function () {
          //console.log("data loaded");
            if (!self.isLoaded()) {
              //$.lazyLoadAdRunning = true;

              // Have to load the current ad...
              //self.data('loading', 'true');
              $.lazyLoadAdRunning = false;
              //self.data('loaded', 'true');


              if (typeof settings.onLoad === 'function') {
                  try {
                      settings.onLoad();
                  } catch (e) {}
              }
            }
        });


        /* When wanted event is triggered load ad */
        /* by triggering appear.                              */
        if ("scroll" !== settings.event) {
            self.bind(settings.event, function (event) {
                if (!self.isLoaded()) {
                    self.trigger("load");
                }
            });
        }
    });
    /* Force initial check if images should appear. */
    $(settings.viewport).trigger('checkLazyLoadAd');

    return this;
  }
  /* Convenience methods in $ namespace.           */
  /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */
  $.belowthefold = function (element, settings) {
      var fold = 0;
      if (settings.viewport === undefined || settings.viewport === window) {
          fold = $(window).height() + $(window).scrollTop();
      } else {
          fold = $(settings.viewport).offset().top + $(settings.viewport).height();
      }
      return fold <= $(element).offset().top - settings.threshold;
  };

  $.abovethetop = function (element, settings) {
      var fold = 0;
      if (settings.viewport === undefined || settings.viewport === window) {
          fold = $(window).scrollTop();
      } else {
          fold = $(settings.viewport).offset().top;
      }
      return fold >= $(element).offset().top + settings.threshold + $(element).height();
  };
})(jQuery);
