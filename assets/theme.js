window.theme = window.theme || {};
theme.Sections = function Sections() {
    this.constructors = {};
    this.instances = [];
    $(document).on('shopify:section:load', this._onSectionLoad.bind(this)).on('shopify:section:unload', this._onSectionUnload.bind(this)).on('shopify:section:select', this._onSelect.bind(this)).on('shopify:section:deselect', this._onDeselect.bind(this)).on('shopify:block:select', this._onBlockSelect.bind(this)).on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};
theme.Sections.prototype = Object.assign({}, theme.Sections.prototype, {
    _createInstance: function(container, constructor) {
        var $container = $(container);
        var id = $container.attr('data-section-id');
        var type = $container.attr('data-section-type');
        constructor = constructor || this.constructors[type];
        if (typeof constructor === 'undefined') {
            return;
        }
        var instance = Object.assign(new constructor(container), {
            id: id,
            type: type,
            container: container
        });
        this.instances.push(instance);
    },
    _onSectionLoad: function(evt) {
        var container = $('[data-section-id]', evt.target)[0];
        if (container) {
            this._createInstance(container);
        }
    },
    _onSectionUnload: function(evt) {
        this.instances = this.instances.filter(function(instance) {
            var isEventInstance = instance.id === evt.detail.sectionId;
            if (isEventInstance && typeof instance.onUnload === 'function') {
                instance.onUnload(evt);
            }
            return !isEventInstance;
        });
    },
    _onSelect: function(evt) {
        var instance = this.instances.find(function(instance) {
            return instance.id === evt.detail.sectionId;
        });
        if (instance && typeof instance.onSelect === 'function') {
            instance.onSelect(evt);
        }
    },
    _onDeselect: function(evt) {
        var instance = this.instances.find(function(instance) {
            return instance.id === evt.detail.sectionId;
        });
        if (instance && typeof instance.onDeselect === 'function') {
            instance.onDeselect(evt);
        }
    },
    _onBlockSelect: function(evt) {
        var instance = this.instances.find(function(instance) {
            return instance.id === evt.detail.sectionId;
        });
        if (instance && typeof instance.onBlockSelect === 'function') {
            instance.onBlockSelect(evt);
        }
    },
    _onBlockDeselect: function(evt) {
        var instance = this.instances.find(function(instance) {
            return instance.id === evt.detail.sectionId;
        });
        if (instance && typeof instance.onBlockDeselect === 'function') {
            instance.onBlockDeselect(evt);
        }
    },
    register: function(type, constructor) {
        this.constructors[type] = constructor;
        $('[data-section-type=' + type + ']').each(function(index, container) {
            this._createInstance(container, constructor);
        }.bind(this));
    }
});

window.theme = theme || {};
// RecoverPassword Page Login
theme.customerTemplates = (function() {
    function initEventListeners() {
        // Show reset password form
        $('#RecoverPassword').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordForm();
        });

        // Hide reset password form
        $('#HideRecoverPasswordLink').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordForm();
        });
    }

    /* Show/Hide recover password form */
    function toggleRecoverPasswordForm() {
        $('#RecoverPasswordForm').toggleClass('hide');
        $('#CustomerLoginForm').toggleClass('hide');
    }

    /* Show reset password success message */
    function resetPasswordSuccess() {
        var $formState = $('.reset-password-success');

        // check if reset password form was successfully submited.
        if (!$formState.length) {
          return;
        }

        // show success message
        $('#ResetSuccess').removeClass('hide');
    }

    /* Show/hide customer address forms */
    function customerAddressForm() {
        var $newAddressForm = $('#AddressNewForm');

        if (!$newAddressForm.length) {
          return;
        }

        // Initialize observers on address selectors, defined in shopify_common.js
        if (Shopify) {
            // eslint-disable-next-line no-new
            new Shopify.CountryProvinceSelector(
                'AddressCountryNew',
                'AddressProvinceNew',
                {
                  hideElement: 'AddressProvinceContainerNew'
                }
            );
        }

        // Initialize each edit form's country/province selector
        $('.address-country-option').each(function() {
            var formId = $(this).data('form-id');
            var countrySelector = 'AddressCountry_' + formId;
            var provinceSelector = 'AddressProvince_' + formId;
            var containerSelector = 'AddressProvinceContainer_' + formId;

            // eslint-disable-next-line no-new
            new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
                hideElement: containerSelector
            });
        });

        // Toggle new/edit address forms
        $('.address-new-toggle').on('click', function() {
            $newAddressForm.toggleClass('hide');
        });

        $('.address-edit-toggle').on('click', function() {
            var formId = $(this).data('form-id');
            $('#EditAddress_' + formId).toggleClass('hide');
        });

        $('.address-delete').on('click', function() {
            var $el = $(this);
            var formId = $el.data('form-id');
            var confirmMessage = $el.data('confirm-message');

            // eslint-disable-next-line no-alert
            if (
                confirm(
                    confirmMessage || 'Are you sure you wish to delete this address?'
                )
            ) {
                Shopify.postLink('/account/addresses/' + formId, {
                    parameters: { _method: 'delete' }
                });
            }
        });
    }

    /* Check URL for reset password hash */
    function checkUrlHash() {
        var hash = window.location.hash;

        // Allow deep linking to recover password form
        if (hash === '#recover') {
          toggleRecoverPasswordForm();
        }
    }

    return {
        init: function() {
            checkUrlHash();
            initEventListeners();
            resetPasswordSuccess();
            customerAddressForm();
        }
    };
})();
// RecoverPassword Popup Index
theme.customerloginTemplates = (function() {
    function initEventsListeners() {
        // Show reset password form
        $('#RecoversPassword').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordFormIndex();
        });

        // Hide reset password form
        $('#HideRecoverPasswordIndex').on('click', function(evt) {
            evt.preventDefault();
            toggleRecoverPasswordFormIndex();
        });
    }

    /* Show/Hide recover password form */
    function toggleRecoverPasswordFormIndex() {
        $('#RecoverPasswordFormIndex').slideToggle('fast');
    }
    return {
        init: function() {
            initEventsListeners();
        }
    };
})();
window.theme = window.theme || {};
theme.Nov_Slickcarousel = (function() {
    function Nov_Slickcarousel() {
        $('[data-section-type="nov-slick"]').each(function (argument) {
            var el = $(this);
            var sectionId = el.attr('data-section-id');
            var slider = el.find('.nov-slick-carousel');
            var sliderNavfor = el.find('.nov-slick-navfor-carousel');
            if ($('html').hasClass('lang-rtl'))
                var rtl = true;
            else
                var rtl = false;
            var autoplay = $(slider).data("autoplay"),
                autoplaytimeout = $(slider).data("autoplaytimeout"),
                infinite = $(slider).data("loop"),
                dots = $(slider).data("dots"),
                nav = $(slider).data("nav"),
                rows = $(slider).data("row"),
                row_mobile = $(slider).data("row_mobile") ? $(slider).data("row_mobile") : 1,
                fade = $(slider).data("fade"),
                items_xl = $(slider).data("items_xl"),
                items_xxl = $(slider).data("items_xxl") ? $(slider).data("items_xxl") : items_xl,
                items_lg = $(slider).data("items_lg"),
                items_md = $(slider).data("items_md"),
                items_sm = $(slider).data("items_sm"),
                items_xs = $(slider).data("items_xs") ? $(slider).data("items_xs") : 1,
                unslick_xs = $(slider).data("unslick"),
                custnav = $(slider).data("custnav"),
                navfor = $(slider).data("navfor"),
                oneslider = $(slider).data("oneslider"),
                vertical = $(slider).data("vertical"),
                vertical_xl = $(slider).data("vertical_xl"),
                vertical_lg = $(slider).data("vertical_lg"),
                vertical_md = $(slider).data("vertical_md"),
                vertical_sm = $(slider).data("vertical_sm"),
                vertical_xs = $(slider).data("vertical_xs"),
                speed = $(slider).data("speed"),
                focus = $(slider).data("focus"),
                hover = $(slider).data("hover"),
                center = $(slider).data("center"),
                initialslide = $(slider).data("initialslide"),
                variablewidth = $(slider).data("variablewidth"),
                swipe = $(slider).data("swipe"),
                cssease = $(slider).data("cssease"),
                appenddots = el.find('.append-dots');
            if (typeof navfor!= "undefined" && navfor == true ) {
                syncing = sliderNavfor;
            } else {
                syncing = null;
            }
            if (typeof custnav!= "undefined") {
              nav = false;
            }
            if (vertical == true) {
                rtl = false
            }

            $(slider).on("init", function(slick) {
                if ($(slider).hasClass('video-play')) {
                    $(slider).find('.slick-active video').trigger('play');
                }
                var classPattern = /col-[a-z]{2,}-\d+|col-\d+|col-[a-z]+-cus-\d+/g;
                $(slider).find('.slick-slide').each(function() {
                    var currentClasses = $(this).attr('class');
                    var newClasses = currentClasses.replace(classPattern, '').trim();
                    $(this).attr('class', newClasses);
                    if ($(this).find('.sp-item').length) {
                        var currentClasses2 = $(this).find('.sp-item').attr('class');
                        var newClasses2 = currentClasses2.replace(classPattern, '').trim();
                        $(this).find('.sp-item').attr('class', newClasses2);
                    }
                })
                var isDragging = false;
                $(slider).on('mousedown touchstart', function(e) {
                    isDragging = true;
                });
                $(slider).on('mousemove touchmove', function(e) {
                    if (isDragging) {
                        $(slider).find('.slick-slide.slick-active:first').prev().addClass('slick-act');
                        $(slider).find('.slick-slide.slick-active:last').next().addClass('slick-act');
                    }
                });
                $(slider).on('mouseup touchend', function() {
                    setTimeout(function(){
                        $(slider).find('.slick-slide').removeClass('slick-act');
                    }, 500)
                    isDragging = false;
                });
            });

            $(slider).on('init reInit afterChange', function(event, slick, currentSlide) {
                $(slider).find('.slick-active video').trigger('play');
            });
            
            $(slider).slick({
                nextArrow: '<div class="arrow-next"><i class="zmdi zmdi-chevron-right"></i></div>',
                prevArrow: '<div class="arrow-prev"><i class="zmdi zmdi-chevron-left"></i></div>',
                rtl: rtl,
                slidesToShow: items_xxl,
                slidesToScroll: $(slider).data("oneslider") ? $(slider).data("oneslider") : items_xxl,
                rows: rows,
                arrows: nav,
                dots: dots,
                infinite: infinite,
                fade: fade,
                speed: speed,
                autoplay: autoplay,
                autoplaySpeed: autoplaytimeout,
                vertical: vertical,
                verticalSwiping: vertical,
                asNavFor: syncing,
                pauseOnFocus: focus,
                pauseOnHover: hover,
                centerMode: center,
                cssEase: cssease,
                swipe: swipe,
                appendDots: appenddots.length ? appenddots : slider,
                responsive: [
                    {
                        breakpoint: 1441,
                        settings: {
                            slidesToShow: items_xl,
                            slidesToScroll: $(slider).data("oneslider") ? 1 : items_xl,
                            vertical: vertical_xl,
                            verticalSwiping: vertical_xl
                        }
                    },
                    {
                        breakpoint: 1200,
                        settings: {
                            slidesToShow: items_lg,
                            slidesToScroll: $(slider).data("oneslider") ? 1 : items_lg,
                            vertical: vertical_lg,
                            verticalSwiping: vertical_lg
                        }
                    },
                    {
                        breakpoint: 992,
                        settings: {
                            slidesToShow: items_md,
                            slidesToScroll: $(slider).data("oneslider") ? 1 : items_md,
                            vertical: vertical_md,
                            verticalSwiping: vertical_md
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: items_sm,
                            slidesToScroll: $(slider).data("oneslider") ? 1 : items_sm,
                            rows: row_mobile,
                            vertical: vertical_sm,
                            verticalSwiping: vertical_sm
                        }
                    },
                    {
                        breakpoint: 576,
                        settings: {
                            slidesToShow: items_xs,
                            slidesToScroll: $(slider).data("oneslider") ? 1 : items_xs,
                            rows: row_mobile,
                            vertical: vertical_xs,
                            verticalSwiping: vertical_xs
                        }
                    }
                ]
            });

            var navautoplay = $(sliderNavfor).data("autoplay"),
                navautoplaytimeout = $(sliderNavfor).data("autoplaytimeout"),
                navinfinite = $(sliderNavfor).data("loop"),
                navdots = $(sliderNavfor).data("dots"),
                navnav = $(sliderNavfor).data("nav"),
                navfade = $(sliderNavfor).data("fade"),
                center = $(sliderNavfor).data("center"),
                variablewidth = $(sliderNavfor).data("variablewidth"),
                navitems_xl = $(sliderNavfor).data("items_xl"),
                navitems_lg = $(sliderNavfor).data("items_lg"),
                navitems_md = $(sliderNavfor).data("items_md"),
                navitems_sm = $(sliderNavfor).data("items_sm"),
                navitems_xs = $(sliderNavfor).data("items_xs") ? $(sliderNavfor).data("items_xs") : 1,
                vertical = $(sliderNavfor).data("vertical"),
                navfor = $(sliderNavfor).data("navfor"),
                navspeed = $(sliderNavfor).data("speed"),
                navfocus = $(sliderNavfor).data("focus"),
                navswipe = $(slider).data("swipe"),
                navhover = $(sliderNavfor).data("hover");
                if (typeof navfor!= "undefined" && navfor == true ) {
                    syncing = slider;
                } else {
                    syncing = null;
                }

            $(sliderNavfor).on("init", function(slick) {
                var classPattern = /col-[a-z]{2,}-\d+|col-\d+|col-[a-z]+-cus-\d+/g;
                $(sliderNavfor).find('.slick-slide').each(function() {
                    var currentClasses = $(this).attr('class');
                    var newClasses = currentClasses.replace(classPattern, '').trim();
                    $(this).attr('class', newClasses);
                    if ($(this).find('.sp-item').length) {
                        var currentClasses2 = $(this).find('.sp-item').attr('class');
                        var newClasses2 = currentClasses2.replace(classPattern, '').trim();
                        $(this).find('.sp-item').attr('class', newClasses2);
                    }
                })
                var isDragging = false;
                $(sliderNavfor).on('mousedown touchstart', function(e) {
                    isDragging = true;
                });
                $(sliderNavfor).on('mousemove touchmove', function(e) {
                    if (isDragging) {
                        $(sliderNavfor).find('.slick-slide.slick-active:first').prev().addClass('slick-act');
                        $(sliderNavfor).find('.slick-slide.slick-active:last').next().addClass('slick-act');
                    }
                });
                $(sliderNavfor).on('mouseup touchend', function() {
                    setTimeout(function(){
                        $(sliderNavfor).find('.slick-slide').removeClass('slick-act');
                    }, 500)
                    isDragging = false;
                });
            });

            $(sliderNavfor).slick({
                nextArrow: '<div class="arrow-next"><i class="zmdi zmdi-chevron-right"></i></div>',
                prevArrow: '<div class="arrow-prev"><i class="zmdi zmdi-chevron-left"></i></div>',
                rtl: rtl,
                slidesToShow: navitems_xl,
                slidesToScroll: navitems_xl,
                dots: navdots,
                arrows: navnav,
                infinite: navinfinite,
                fade: navfade,
                autoplay: navautoplay,
                autoplaySpeed: navautoplaytimeout,
                asNavFor: syncing,
                centerMode: center,
                variableWidth: variablewidth,
                speed: navspeed,
                pauseOnFocus: navfocus,
                pauseOnHover: navhover,
                vertical: vertical,
                verticalSwiping: vertical,
                swipe: navswipe,
                responsive: [
                    {
                        breakpoint: 1441,
                        settings: {
                            slidesToShow: navitems_xl,
                            slidesToScroll: navitems_xl
                        }
                    },
                    {
                        breakpoint: 1200,
                        settings: {
                            slidesToShow: navitems_lg,
                            slidesToScroll: navitems_lg
                        }
                    },
                    {
                        breakpoint: 992,
                        settings: {
                            slidesToShow: navitems_md,
                            slidesToScroll: navitems_md
                        }
                    },
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: navitems_sm,
                            slidesToScroll: navitems_sm
                        }
                    },
                    {
                        breakpoint: 576,
                        settings: {
                            slidesToShow: navitems_xs,
                            slidesToScroll: navitems_xs
                        }
                    }
                ]
            });

            checkClasses(slider);
            var currentSlide = $(slider).slick('slickCurrentSlide');
            if ($(slider).find('.slick-cloned').length == 0) {
                checkArrow(slider, currentSlide);
            }
            $(slider).on('afterChange', function(event, slick, currentSlide, nextSlide){
                checkClasses(slider);
                if (infinite == false) {
                    checkArrow(slider, currentSlide);
                }
                if ($(slider).hasClass('video-current-play')) {
                    $(slider).find('video').trigger('pause');
                    $(slider).find('.slick-active video').trigger('play');
                }
            });
            function checkClasses(class_parent) {
                var total = $('.slick-list .slick-active', class_parent).length;
                $('.slick-list .slick-slide', class_parent).removeClass('firstActiveItem lastActiveItem');

                $('.slick-list .slick-active', class_parent).each(function (index) {
                    if (index === 0 && rtl === false) {
                        // this is the first one
                        $(this).addClass('firstActiveItem');
                    } else if (index === 0 && rtl === true) {
                        $(this).addClass('lastActiveItem');
                    }
                    if (index === total - 1 && total > 1 && rtl === false) {
                        // this is the last one
                        $(this).addClass('lastActiveItem');
                    } else if (index === total - 1 && total > 1 && rtl === true) {
                        $(this).addClass('firstActiveItem');
                    }
                });
            };
            function checkArrow(el, current) {
                var num = $(el).find('.slick-slide').length,
                    num_act = $(el).find('.slick-slide.slick-active').length,
                    prev = $(el).parents('[data-section-type="nov-slick"]').find('.nav-prev'),
                    next = $(el).parents('[data-section-type="nov-slick"]').find('.nav-next');
                if (num - num_act == 0) {
                    prev.css('visibility', 'hidden');
                    next.css('visibility', 'hidden');
                } else {
                    prev.css('visibility', 'visible');
                    next.css('visibility', 'visible');
                }
                if(current == 0) {
                    prev.addClass('disabled');
                } else {
                    prev.removeClass('disabled');
                }
                if (num - num_act <= current) {
                    next.addClass('disabled');
                } else {
                    next.removeClass('disabled');
                }
            };
            if (typeof custnav != "undefined") {
                $('.nav-prev', '#shopify-section-' + sectionId).click(function(){
                   $(slider).slick('slickPrev');
                });
                $('.nav-next', '#shopify-section-' + sectionId).click(function(){
                   $(slider).slick('slickNext');
                })
            };
            if ($(window).width() < 576 && unslick_xs == true ) {
                $(slider).slick('unslick');
            }


            let isSliding = false;
            $('.nov-slick-dot', '#shopify-section-' + sectionId).on('click', function(event) {
                event.preventDefault();
                if (isSliding) return;
                isSliding = true;
                $('.nov-slick-dot', '#shopify-section-' + sectionId).removeClass('current');
                $(this).addClass('current');
                var goToSingleSlide = $(this).data('index');
                $(slider).slick('slickGoTo', goToSingleSlide);
            });

            $(slider).on('beforeChange', function(event, slick, currentSlide, nextSlide) {
                isSliding = true;
                if ($('#shopify-section-' + sectionId).find('.nov-slick-dot').length > 0) {
                    $('#shopify-section-' + sectionId).find('.nov-slick-dot').removeClass('current');
                    $('#shopify-section-' + sectionId).find('.nov-slick-dot[data-index='+ nextSlide +']').addClass('current');
                }
            });

            $(slider).on('afterChange', function(event, slick, currentSlide) {
                isSliding = false;
            });
        });
    }
    return Nov_Slickcarousel;
})();
theme.Nov_SliderShow = (function() {
    function Nov_SliderShow(container) {
        var $container = (this.$container = $(container));
        var sectionId = $container.attr('data-section-id');
        var slideWrapper = (this.slideWrapper = '#shopify-section-' + sectionId + ' .main-slider');
        
        if($('html').hasClass('lang-rtl'))
            var rtl = true;
        else
            var rtl = false;

        var autoplay = $(slideWrapper).data('autoplay'),
            speed = $(slideWrapper).data('speed'),
            arrows = $(slideWrapper).data('arrows'),
            dots = $(slideWrapper).data('dots'),
            loadingBar = $(slideWrapper).data('loading-bar'),
            zoom = $(slideWrapper).data('zoom'),
            appenddots = '#shopify-section-' + sectionId + ' .append-dots';
        $(function() {
            $(slideWrapper).on("init", function(slick) {
                slick = $(slick.currentTarget);
                if (autoplay == true && typeof loadingBar != "undefined") {
                    $(slideWrapper).find('.slick-current').addClass('timer');
                }
                $(slideWrapper).find('.slick-current video').trigger('play');
                setTimeout(function() {
                    $(slideWrapper).find(".slick-current .slide-image").addClass("first-zoomin");
                    $(".slick-current .caption-animate", slideWrapper).each(function() {
                        var caption = $(this).data("animate");
                        $(this).addClass(caption);
                    });
                }, 700);
            });
            $(slideWrapper).on("beforeChange", function(event, slick) {
                slick = $(slick.$slider);
                $(".slick-current .caption-animate", slideWrapper).each(function() {
                    var caption = $(this).data("animate");
                    $(this).removeClass(caption);
                });
                if (zoom == true) {
                    $(slideWrapper).find(".slick-current .slide-image").removeClass("zoom_img");
                }
                if (autoplay == true && typeof loadingBar != "undefined") {
                    $(slideWrapper).find('.slick-current').removeClass('timer');
                }
                $(slideWrapper).find(".slide-image").removeClass('first-zoomin');
                $(slideWrapper).find(".slide-image").removeClass('first-scale');

                $(slideWrapper).find(':focus').blur();
            });
            $(slideWrapper).on("afterChange", function(event, slick, currentSlide) {
                $(".caption-animate", '.slick-current').each(function() {
                    var caption = $(this).data("animate");
                    $(this).addClass(caption);
                });
                if (zoom == true) {
                    $(slideWrapper).find(".slick-current .slide-image").addClass("zoom_img");
                }
                if (autoplay == true && typeof loadingBar != "undefined") {
                    $(slideWrapper).find('.slick-current').addClass('timer');
                }
                $(slideWrapper).find('.slick-slide').attr('inert', 'true').attr('aria-hidden', 'true');
                $(slideWrapper).find('.slick-current').removeAttr('inert').attr('aria-hidden', 'false');

                $(slideWrapper).find('video').trigger('pause');
                $(slideWrapper).find('.slick-current video').trigger('play');

                slick = $(slick.$slider);
            });
            $(slideWrapper).slick({
                nextArrow: '<div class="arrow-next"></div>',
                prevArrow: '<div class="arrow-prev"></div>',
                autoplay: autoplay,
                autoplaySpeed: speed,
                lazyLoad: "progressive",
                pauseOnHover: false,
                pauseOnFocus: false,
                speed: 600,
                fade: true,
                arrows: arrows,
                dots: dots,
                cssEase: "cubic-bezier(0.87, 0.03, 0.41, 0.9)",
                rtl: rtl,
                adaptiveHeight: true,
                appendDots: appenddots.length ? appenddots : slider,
            });
            $('.nav-prev', '#shopify-section-' + sectionId).click(function(){
               $(slideWrapper).slick('slickPrev');
            });
            $('.nav-next', '#shopify-section-' + sectionId).click(function(){
               $(slideWrapper).slick('slickNext');
            })
        });
    }
    return Nov_SliderShow;
})();
theme.Nov_Swipercarousel = (function () {
    function Nov_Swipercarousel(container) {
        var $container = $(container);
        var sectionId = $container.attr("data-section-id");
        var nov_slider = "#shopify-section-" + sectionId + " .nov-swiper-carousel";
        var items_xxl = $(nov_slider).data("items_xxl") || 4;
        var items_xl = $(nov_slider).data("items_xl") || 4;
        var items_lg = $(nov_slider).data("items_lg") || 3;
        var items_md = $(nov_slider).data("items_md") || 3;
        var items_sm = $(nov_slider).data("items_sm") || 2;
        var items_xs = $(nov_slider).data("items_xs") || 2;
        var row_number = $(nov_slider).data("row") || 1;
        var row_mobile = $(nov_slider).data("row_mobile") || 1;
        var spacing = $(nov_slider).data("spacing") || 30;
        var loop = $(nov_slider).data("loop") || false;
        var spacing_mobile = $(nov_slider).data("spacing_mobile") || 10;
        var nextButton = "#shopify-section-" + sectionId + " .nav-next";
        var prevButton = "#shopify-section-" + sectionId + " .nav-prev"
        var pagination = "#shopify-section-" + sectionId + " .swiper-pagination";
        var scrollbar = $container.find(".nov-swiper-carousel .swiper-scrollbar")[0];

        var slides = [];
        var slideItems = $(nov_slider).find(".swiper-slide");
        var totalSlides = slideItems.length;

        if (loop) {
            slideItems.each(function (index, element) {
                slides.push($(element).html());
            });
        }
        var swiper = new Swiper(nov_slider, {
            slidesPerView: items_xxl,
            slidesPerGroup: items_xxl,
            spaceBetween: spacing,
            watchSlidesProgress: true,
            loop: loop,
            navigation: {
                nextEl: nextButton,
                prevEl: prevButton,
            },
            pagination: {
                el: pagination,
                type: "bullets",
                clickable: true,
            },
            scrollbar: {
                el: scrollbar,
                draggable: true,
            },
            grid: {
                rows: row_number,
                fill: "row",
            },
            breakpoints: {
                1441: {
                    slidesPerView: items_xxl,
                    spaceBetween: spacing,
                    grid: {
                        rows: row_number,
                        fill: "row",
                    },
                },
                1200: {
                    slidesPerView: items_xl,
                    spaceBetween: spacing,
                    grid: {
                        rows: row_number,
                        fill: "row",
                    },
                },
                992: {
                    slidesPerView: items_lg,
                    spaceBetween: spacing,
                    grid: {
                        rows: row_number,
                        fill: "row",
                    },
                },
                768: {
                    slidesPerView: items_md,
                    spaceBetween: spacing,
                    grid: {
                        rows: row_number,
                        fill: "row",
                    },
                },
                576: {
                    slidesPerView: items_sm,
                    spaceBetween: spacing_mobile,
                    grid: {
                        rows: row_mobile,
                        fill: "row",
                    },
                },
                320: {
                    slidesPerView: items_xs,
                    spaceBetween: spacing_mobile,
                    grid: {
                        rows: row_mobile,
                        fill: "row",
                    },
                },
                100: {
                    slidesPerView: 1,
                    spaceBetween: 10,
                    grid: {
                        rows: 1,
                        fill: "row",
                    },
                },
            },
            simulateTouch: true,
            touchEventsTarget: 'container',
            renderSlide: function (index, className) {
                if (loop) {
                    return (
                        '<div class="swiper-slide ' + className + '">' + slides[index % totalSlides] + "</div>"
                    );
                } else {
                    return (
                        '<div class="swiper-slide ' + className + '">' + slides[index] + "</div>"
                    );
                }
            }
        });

        var isNavigating = false;

        function handleNavigationClick(event) {
            if (isNavigating) {
                return;
            }
            isNavigating = true;
            nextBtn.style.pointerEvents = "none";
            prevBtn.style.pointerEvents = "none";
            setTimeout(() => {
                isNavigating = false;
                nextBtn.style.pointerEvents = "auto";
                prevBtn.style.pointerEvents = "auto";
            }, 400);
        }
        var nextBtn = document.querySelector("#shopify-section-" + sectionId + " .nav-next");
        var prevBtn = document.querySelector("#shopify-section-" + sectionId + " .nav-prev");
        if (nextBtn) {
            nextBtn.addEventListener("click", handleNavigationClick);
        }
        if (prevBtn) {
            prevBtn.addEventListener("click", handleNavigationClick);
        }
    }
    return Nov_Swipercarousel;
})();
$(document).ready(function() {
    var sections = new theme.Sections();
    sections.register('slideshow-section', theme.Nov_SliderShow);
    sections.register("nov-swiper", theme.Nov_Swipercarousel);
    theme.Nov_Slickcarousel();
});
theme.init = function() {
    theme.customerTemplates.init();
    theme.customerloginTemplates.init();
    $('a[href="#"]').on('click', function(evt) {
        evt.preventDefault();
    });
};
$(theme.init);
