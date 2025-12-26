'use strict';
$.cookie = function(key, value, options) {
    if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
        options = $.extend({}, options);
        if (value === null || value === undefined) {
            options.expires = -1
        }
        if (typeof options.expires === 'number') {
            var days = options.expires,
                t = options.expires = new Date();
            t.setDate(t.getDate() + days)
        }
        value = String(value);
        return (document.cookie = [encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value), options.expires ? '; expires=' + options.expires.toUTCString() : '', options.path ? '; path=' + options.path : '', options.domain ? '; domain=' + options.domain : '', options.secure ? '; secure' : ''].join(''))
    }
    options = value || {};
    var decode = options.raw ? function(s) {
        return s
    } : decodeURIComponent;
    var pairs = document.cookie.split('; ');
    for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
        if (decode(pair[0]) === key) return decode(pair[1] || '')
    }
    return null
}
if ((typeof Shopify) === 'undefined') {
    Shopify = {};
}
if (!Shopify.formatMoney) {
    Shopify.formatMoney = function(cents, format) {
        var value = '',
            placeholderRegex = /\{\{\s*(\w+)\s*\}\}/,
            formatString = (format || this.money_format);
        if (typeof cents == 'string') {
            cents = cents.replace('.', '');
        }

        function defaultOption(opt, def) {
            return (typeof opt == 'undefined' ? def : opt);
        }

        function formatWithDelimiters(number, precision, thousands, decimal) {
            precision = defaultOption(precision, 2);
            thousands = defaultOption(thousands, ',');
            decimal = defaultOption(decimal, '.');
            if (isNaN(number) || number == null) {
                return 0;
            }
            number = (number / 100.0).toFixed(precision);
            var parts = number.split('.'),
                dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
                cents = parts[1] ? (decimal + parts[1]) : '';
            return dollars + cents;
        }
        switch (formatString.match(placeholderRegex)[1]) {
            case 'amount':
                value = formatWithDelimiters(cents, 2);
                break;
            case 'amount_no_decimals':
                value = formatWithDelimiters(cents, 0);
                break;
            case 'amount_with_comma_separator':
                value = formatWithDelimiters(cents, 2, '.', ',');
                break;
            case 'amount_no_decimals_with_comma_separator':
                value = formatWithDelimiters(cents, 0, '.', ',');
                break;
        }
        return formatString.replace(placeholderRegex, value);
    };
}
window.novtheme = window.novtheme || {};
if ($('html').hasClass('lang-rtl')) {
    var rtl = true;
} else {
    var rtl = false;
}
var body = $('body');
var sidebarOverlay = $(".sidebar-overlay");
var currentWidth = $(window).width();
var responsive_mobile = currentWidth < 768;
var isClickEventAttached = false;
var searchCanvas = $('.nov-search__canvas');
novtheme.init = function() {
    novtheme.toggleMobileStyles();
    novtheme.eventBlockCart();
    novtheme.ProductDetail();
    novtheme.VerticalThumbnailProductDetail();
    novtheme.ThumbnailProductDetail();
    novtheme.load_canvas_menu();
    novtheme.NovTogglePage();
    novtheme.Countdown();
    novtheme.goToTop();
    novtheme.MenuSidebar();
    novtheme.HideShowPassword();
    novtheme.NovSearchToggle();
    novtheme.searchTrendWidth();
    novtheme.SearchAutoComplete();
    novtheme.tooltip();
    novtheme.Nov_iframe_video();
    novtheme.MegaMenuSlider();
    novtheme.LoadmoreByButton();
    novtheme.Mainmenu();
    novtheme.CollectionPage();
    novtheme.CollectionPageLoadmore();
    novtheme.NovAccordion();
    novtheme.ObserverActive();
    novtheme.LookBook();
    novtheme.LanguageCountry();
    novtheme.CartExtent();
    novtheme.AddActive();
    novtheme.Header_mobile();
    novtheme.Copy();
    novtheme.StickyHeader();
    novtheme.ParallaxImage();
    novtheme.BtnSlider();
    novtheme.CollectionTab();
    novtheme.NumberAnimate();
    novtheme.FakeOrder();
    novtheme.VerticalMenu();
    novtheme.Parallax();
    novtheme.OverlayBlur();
    novtheme.ToggleUpDown();
    novtheme.Comparisons();
    //novtheme.MarqueeY();
    novtheme.TextAnimate();
    novtheme.BlockOverflowScroll();
}; 
//Tooltip, activated by hover event
novtheme.tooltip = function() {
    body.tooltip({
        selector: "[data-toggle='tooltip']",
        container: "body"
    });
};
novtheme.swapChildren = function(obj1, obj2) {
    var temp = obj2.children().detach();
    obj2.empty().append(obj1.children().detach());
    obj1.append(temp);
};
novtheme.toggleMobileStyles = function() {
    if (responsive_mobile) {
        $("*[id^='_desktop_']").each(function(idx, el) {
            var target = $('#' + el.id.replace('_desktop_', '_mobile_'));
            if (target) {
                novtheme.swapChildren($(el), target);
            }
        });
    } else {
        $("*[id^='_mobile_']").each(function(idx, el) {
            var target = $('#' + el.id.replace('_mobile_', '_desktop_'));
            if (target) {
                novtheme.swapChildren($(el), target);
            }
        });
    }
};
novtheme.toggleSticky = function(action) {
    if (action == true) {
        $("*[class^='contentsticky_']").each(function(idx, el) {
            var target = $('.' + el.classList['0'].replace('contentsticky_', 'contentstickynew_'));
            if (target.length) {
                novtheme.swapChildren($(el), target);
            }
        });
    } else {
        $("*[class^='contentstickynew_']").each(function(idx, el) {
            var target = $('.' + el.classList['0'].replace('contentstickynew_', 'contentsticky_'));
            if (target.length) {
                novtheme.swapChildren($(el), target);
            }
        });
    }
};
novtheme.StickyHeader = function() {
    const $siteHeader = $('.site-header');
    if ($siteHeader.hasClass('sticky-header')) {
        let isHeaderSticky = false;
        let prevScroll = $(window).scrollTop();
        const headerHeight = $siteHeader.outerHeight();
        const $headerCenter = $('.header-center');
        const centerHeight = $headerCenter.outerHeight();
        $(window).on('scroll', function() {
           const scrollTop = $(this).scrollTop();
           if (scrollTop < prevScroll && scrollTop > headerHeight) {
                if (!isHeaderSticky) {
                    $('#header-sticky').addClass('sticky-header-active');
                    $siteHeader.css('height', headerHeight);
                    novtheme.toggleSticky(true)
                    isHeaderSticky = true;
                    novtheme.searchTrendWidth();
                }
            } else {
                if (isHeaderSticky) {
                    $('#header-sticky').removeClass('sticky-header-active');
                    $siteHeader.css('height', 'auto');
                    novtheme.toggleSticky(false)
                    isHeaderSticky = false;
                    novtheme.searchTrendWidth();
                }
            }
          prevScroll = scrollTop;
        });
    }
    if (responsive_mobile) {
        var headerMobile = $('.header-mobile');
        if (headerMobile.hasClass('sticky-header-mobile')) {
            var mobileMenu = $('#mobile_menu');
            var height_m = $('.site-header').height();
            var flag_m = true;
            var offsetTop_m = 0;
            var height_promotion = 0;
            $(window).scroll(function() {
                var scrollTop_m = $(window).scrollTop();
                if (scrollTop_m < offsetTop_m && scrollTop_m > height_m) {
                    if (flag_m == true) {
                        headerMobile.addClass('sticky-header-active');
                        flag_m = false;
                    }
                } else {
                    if (flag_m == false) {
                        headerMobile.removeClass('sticky-header-active');
                        flag_m = true;
                    }
                }
                offsetTop_m = scrollTop_m;
                if ($(window).scrollTop() > height_m) {
                    headerMobile.addClass('down');
                } else {
                    headerMobile.removeClass('down');
                }
            });
        }
    }
    var topHeader = $('.site-header').offset().top;
    $('.site-header').css('--offset-top', topHeader + 'px');
};
novtheme.load_canvas_menu = function() {
    var $main_menu = $(".site-nav-mobile");
    if ($("#canvas-main-menu").length < 1 && $main_menu.length > 0) {
        var $menu = $main_menu.parent().clone();
        $menu.attr("id", "canvas-main-menu");
        $($menu).find(".menu").removeAttr('id');
        $('.canvas-menu').append($menu);
        $menu.mmenu({
            offCanvas: false,
            "navbar": {
                "title": false
            }
        });
    }
    $('.mm-next').click(function(){
        $('.navmenu-product .grid--view-items').slick('refresh');
    })
};
novtheme.Header_mobile = function() {
    var mobileMenu = $('#mobile_menu'),
        mobilesearch = $('#mobile_search'),
        showMegamenu = $('#show-megamenu'),
        mobileBtnSearch = $('.mobile-btn_search');
    showMegamenu.click(function(){
        if ($(this).hasClass('act')) {
            $(this).removeClass('act');
            body.css('overflow', 'auto');
            sidebarOverlay.add(mobileMenu).removeClass('act');
            sidebarOverlay.css('z-index', '99')
        } else {
            $(this).addClass('act');
            body.css('overflow', 'hidden');
            sidebarOverlay.add(mobileMenu).addClass('act');
            sidebarOverlay.css('z-index', '100')
        }
        mobilesearch.add(mobileBtnSearch).removeClass('act');
    });
    mobileBtnSearch.click(function(){
        if ($(this).hasClass('act')) {
            $(this).removeClass('act');
            mobilesearch.removeClass('act');
        } else {
            $(this).addClass('act');
            mobilesearch.addClass('act');
        }
        body.css('overflow', 'auto');
        sidebarOverlay.add(showMegamenu).add(mobileMenu).removeClass('act');
    })
    $('.search_overlay').click(function() {
        mobilesearch.removeClass('act');
        mobileBtnSearch.removeClass('act');
    })
};
novtheme.Copy = function () {
    $('.copy-btn').click(function() {
        const el = $(this);
        const copy = el.data('copy');
        const copied = el.data('copied');
        const input = el.siblings('input')[0];
        input.select();
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
        el.text(copied);
        setTimeout(() => el.text(copy), 2500);
    });
};
novtheme.ProductDetail = function() {
    jQuery('product-variant-swatch :radio, product-variant-dropdown select').change(function() {
      var optionValue = jQuery(this).val();
      jQuery(this).parents('fieldset, .product-form__input').find('.variant_current').text(optionValue);
      // Style image grid and scroll
      if ($(window).width() > 991 ) {
        if ($('.product-template__imggrid').length > 0 || $('.product-template__scroll').length > 0) {
          setTimeout(function() {
            var parent = $('.product-template__imggrid .proFeaturedImage, .product-template__scroll .proFeaturedImage'),
                active = parent.find('.act'),
                positi = active.data('position'),
                offset = active.offset().top;
                $("body,html").animate({scrollTop: offset}, "normal");
                $('.thumbItem').removeClass('active');
                $('.thumbItem[data-position="'+ positi +'"]').addClass('active');
          }, 200);
        }
      }
    });
    if ($('.product-single__stick-add').length > 0) {
      var winHeight = $(window).height();
      $(window).scroll(function() {
        if ($(window).scrollTop() > winHeight) {
          $('.product-single__stick-add').addClass('act');
        } else {
          $('.product-single__stick-add').removeClass('act');
        }
      });
      $(window).on('load', function() {
        if($('.product-single__stick-add').length > 0 && currentWidth>=768) {
          var h = $('.product-single__stick-add').height();
          body.css('padding-bottom', h)
        }
      })
    }
};
novtheme.VerticalThumbnailProductDetail= function() {
    var proTemplateScroll = $('.product-template__scroll');
    var proFeaturedImage = proTemplateScroll.find('.proFeaturedImage');
    if (currentWidth > 991 && $('.template-product').length > 0 ) {
        $(window).on('mousewheel DOMMouseScroll wheel', (function(e) {
            proFeaturedImage.find('.item.act').each(function(){
                var item = $(this),
                    p = item.data('position'),
                    hd = item.height()/2,
                    srt = $(window).scrollTop(),
                    y = e.originalEvent.deltaY,
                    offset_top = item.offset().top;
                if (y > 0) {
                    if (p < proFeaturedImage.find('.item').length) {
                        var npd = p + 1;
                    } else {
                        var npd = p;
                    }
                    if (srt > offset_top + hd) {
                       item.removeClass('act');
                       proFeaturedImage.find('.item[data-position="'+ npd +'"]').addClass('act');
                       $('.thumbItem').removeClass('active');
                       $('.thumbItem[data-position="'+ npd +'"]').addClass('active');
                    }
                } else {
                    if (p > 1) {
                        var npu = p - 1;
                    } else {
                        var npu = p;
                    }
                    if (srt < offset_top - hd) {
                        item.removeClass('act');
                        proFeaturedImage.find('.item[data-position="'+ npu +'"]').addClass('act');
                        $('.thumbItem').removeClass('active');
                        $('.thumbItem[data-position="'+ npu +'"]').addClass('active');
                    }
                }
                proTemplateScroll.find('.thumb_vertical_slick').slick('slickGoTo', p);
            });
        }));
        proTemplateScroll.find('.thumbItem').click(function(){
            var p = $(this).data('position');
            proTemplateScroll.find('.thumbItem').removeClass('active');
            $(this).addClass('active');
            proFeaturedImage.find('.item').removeClass('act');
            proFeaturedImage.find('.item[data-position="'+ p +'"]').addClass('act');
            var ost = proFeaturedImage.find('.item.act').offset().top;
            $("body,html").animate({scrollTop: ost - 60}, "normal");
        });
    }
    if (currentWidth < 992 ) {
        $('.product-template__scroll .proFeaturedImage, .product-template__imggrid .proFeaturedImage').slick({
            slide: '.item',
            infinite: false,
            arrows: false,
            dots: true,
            slidesToShow: 1,
            slidesToScroll: 1
        }).on('afterChange',function(e,o){
            $('iframe').each(function(){
                $(this)[0].contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
            });
            proFeaturedImage.find('.slick-slide:not(.slick-active) video').trigger('pause');
        });
        proFeaturedImage.on('afterChange', function(event, slick, currentSlide) {
            $('#productThumbs .thumb_slick').slick('slickGoTo', currentSlide);
            $('#productThumbs .thumb_slick').find('.slick-slide').removeClass('active');
            $('#productThumbs .thumb_slick').find('.slick-slide[data-slick-index="' + currentSlide + '"]').addClass('active');
        });

        $('.product-template__scroll .thumb_slick').on('click', '.thumbItem', function(event) {
            event.preventDefault();
            $('.thumb_slick').find('.slick-slide').removeClass('active');
            $(this).addClass('active');
            var goToSingleSlide = $(this).data('slick-index');
            $('.product-template__scroll .proFeaturedImage').slick('slickGoTo', goToSingleSlide);
        });
        $('product-variant-swatch label').click(function () {
            setTimeout(function() {
                var dindex = $('.product-template__scroll .proFeaturedImage, .product-template__imggrid .proFeaturedImage').find('.item.act').attr('data-slick-index');
                $('.product-template__scroll .proFeaturedImage, .product-template__imggrid .proFeaturedImage').slick('slickGoTo', dindex);
            }, 300);
        })
    }
};
novtheme.ThumbnailProductDetail = function() {
    var $FeaturedImage = $('.FeaturedImage_slick');
    var $ThumbImage = $('#productThumbs .thumb_slick');
    var dots = $FeaturedImage.data("dots"),
        nav = $FeaturedImage.data("nav"),
        draggable = $FeaturedImage.data("draggable"),
        fade = $FeaturedImage.data("fade"),
        items = $FeaturedImage.data("items"),
        items_lg = $FeaturedImage.data("items_lg"),
        items_md = $FeaturedImage.data("items_md"),
        items_sm = $FeaturedImage.data("items_sm"),
        items_xs = $FeaturedImage.data("items_xs"),
        qtyItem = $ThumbImage.find('.item').length;
        if (qtyItem < 20) {
            var dotXs = true;
        }else {
            var dotXs = false;
        }
    $FeaturedImage.slick({
        slide: '.item',
        nextArrow: '<div class="arrow-next"><i class="zmdi zmdi-chevron-right"></i></div>',
        prevArrow: '<div class="arrow-prev"><i class="zmdi zmdi-chevron-left"></i></div>',
        slidesToShow: items,
        slidesToScroll: items,
        dots: dots,
        arrows: nav,
        adaptiveHeight: true,
        infinite: true,
        speed: 500,
        cssEase: 'cubic-bezier(0.77, 0, 0.18, 1)',
        rtl: rtl,
        draggable: draggable,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: items_lg,
                    slidesToScroll: items_lg,
                    vertical: vertical_lg,
                    verticalSwiping: vertical_lg,
                }
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: items_md,
                    slidesToScroll: items_md
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: items_sm,
                    slidesToScroll: items_sm,
                    dots: false
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: items_xs,
                    slidesToScroll: items_xs,
                    dots: dotXs
                }
            }
        ]
    });

    var autoplay = $ThumbImage.data("autoplay"),
        autoplaytimeout = $ThumbImage.data("autoplaytimeout"),
        infinite = $ThumbImage.data("loop"),
        dots = $ThumbImage.data("dots"),
        nav = $ThumbImage.data("nav"),
        loop = $ThumbImage.data('loop'),
        fade = $ThumbImage.data("fade"),
        vertical = $ThumbImage.data("vertical"),
        vertical_lg = $ThumbImage.data("vertical_lg"),
        vertical_md = $ThumbImage.data("vertical_md"),
        vertical_sm = $ThumbImage.data("vertical_sm"),
        items = $ThumbImage.data("items"),
        items_lg = $ThumbImage.data("items_lg"),
        items_md = $ThumbImage.data("items_md"),
        items_sm = $ThumbImage.data("items_sm"),
        items_xs = $ThumbImage.data("items_xs");
        if (vertical == true) {
            rtl = false;
        }
    $ThumbImage.on('init', function(event, slick) {
        $(this).find('.slick-slide.slick-current').addClass('active');
    })
    .slick({
        nextArrow: '<div class="arrow-next"><i class="zmdi zmdi-chevron-right"></i></div>',
        prevArrow: '<div class="arrow-prev"><i class="zmdi zmdi-chevron-left"></i></div>',
        infinite: infinite,
        slidesToShow: items,
        slidesToScroll: 1,
        dots: dots,
        arrows: nav,
        rtl: rtl,
        vertical: vertical,
        verticalSwiping: vertical,
        focusOnSelect: true,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: items_lg,
                    slidesToScroll: 1,
                    vertical: vertical_lg,
                    verticalSwiping: vertical_lg,
                }
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: items_md,
                    slidesToScroll: 1,
                    vertical: vertical_md,
                    verticalSwiping: vertical_md,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: items_sm,
                    slidesToScroll: 1,
                    vertical: vertical_sm,
                    verticalSwiping: vertical_sm,
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: items_xs,
                    slidesToScroll: 1,
                    vertical: false,
                    verticalSwiping: false
                }
            }
        ]
    });
    $FeaturedImage.on('afterChange', function(event, slick, currentSlide) {
        $ThumbImage.slick('slickGoTo', currentSlide);
        $ThumbImage.find('.slick-slide.active').removeClass('active');
        $ThumbImage.find('.slick-slide[data-slick-index="' + currentSlide + '"]').addClass('active');
        $FeaturedImage.find('.slick-slide:not(.slick-active) iframe').each(function(){
            $(this)[0].contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
        });
        $FeaturedImage.find('.slick-slide:not(.slick-active) video').trigger('pause');
        // Type thumb grid
        $('.thumbgrid .thumbItem').removeClass('active');
        $('.thumbgrid .thumbItem[data-position="' + currentSlide + '"]').addClass('active');
    });
    $ThumbImage.on('click', '.slick-slide', function(event) {
        event.preventDefault();
        $ThumbImage.find('.slick-slide.active').removeClass('active');
        $(this).addClass('active');
        var position = $(this).data('slick-index');
        $FeaturedImage.slick('slickGoTo', position);
    });
    // Type thumb grid
    $('.thumbgrid .thumbItem').on('click', function(event) {
        event.preventDefault();
        var position = $(this).data('position');
        $FeaturedImage.slick('slickGoTo', position);
    });
    $('product-variant-swatch :radio, product-variant-dropdown select').change(function() {
        setTimeout(function() {
            var dindex = $FeaturedImage.find('.item.act').attr('data-slick-index');
            $FeaturedImage.slick('slickGoTo', dindex);
        }, 300);
    })
    if (responsive_mobile) {
        $('.thumbgrid .thumblist').slick({
            infinite: false,
            arrows: false,
            dots: false,
            slidesToShow: 4,
            slidesToScroll: 4
        })
    }
};
novtheme.Countdown = function() {
    function startCountdown($countdown, showDays, restartCountdown) {
        var finalDate = $countdown.data('countdown');
        var showDays = showDays || false;
        var restartCountdown = restartCountdown || false;
        var finalDateGetTime = new Date(finalDate).getTime();
        var NewfinalDate = "";
        var now = new Date();
        if (finalDateGetTime - now.getTime() < 0 && restartCountdown == true) {
            NewfinalDate = new Date(now.getTime() + (86400 - (now.getHours() * 60 * 60) - (now.getMinutes() * 60) - now.getSeconds()) * 1000);
        } else {
            NewfinalDate = finalDate;
        }
        var dayString = showDays ? '<div class="item-time"><span class="data-number">%D</span><span class="name-time">'+ theme.strings.days +'</span></div>' : '';
        var countdown_format = dayString
                           + '<div class="item-time"><span class="data-number">%H</span><span class="name-time">'+ theme.strings.hours +'</span></div>'
                           + '<div class="item-time"><span class="data-number">%M</span><span class="name-time">'+ theme.strings.minutes +'</span></div>'
                           + '<div class="item-time"><span class="data-number">%S</span><span class="name-time">'+ theme.strings.seconds +'</span></div>';
        $countdown.countdown(NewfinalDate, function(event) {
            $countdown.html(event.strftime(countdown_format));
        }).on('finish.countdown', function() {
            if (restartCountdown) {
                startCountdown($countdown, showDays, restartCountdown);
            }
        });
    }

    $('[data-countdown]').each(function() {
        var showDays = $(this).data('show-days') || false;
        var restartCountdown = $(this).data('restart') || false;
        startCountdown($(this), showDays, restartCountdown);
    });
};
novtheme.eventBlockCart = function(e) {
    $('.header-cart').click(function(){
        sidebarOverlay.addClass('act');
        $("#desktop_cart").addClass('active');
        $('.nov_item_act, .nov_btn_act').removeClass('act');
        if (responsive_mobile) {
            body.addClass('open-canvans-cart');
            $('#show-megamenu, #mobile_menu').removeClass('act');
        }
    });
    $('.close_cart').click(function(){
        sidebarOverlay.removeClass('act');
        $('#desktop_cart').removeClass('active');
        $('.cart_extend').removeClass('act');
        $('.extend--label__item').removeClass('act').each(function() {
            var title = $(this).data('title');
            $(this).attr('data-original-title', title);
        });
        $('.cart_extend--label').removeClass('act');
        $('.nov_item_act, .nov_btn_act').removeClass('act');
        if (responsive_mobile) {
            body.removeClass('open-canvans-cart');
        }
    });
};
novtheme.NovTogglePage = function() {
    $('.nov-toggle-page[data-target="#mobile-pageaccount"]').on('click', function(e) {
        var target = $(this).data('target');
        $(target).hasClass('active') ? ($(target).removeClass('active'), sidebarOverlay.removeClass('act').css('z-index', '99')) : ($(target).addClass('active'), sidebarOverlay.addClass('act').css('z-index', '999'));
        e.preventDefault();
    });
    $('.mobile-boxpage .close-box').on('click', function(e) {
        $(this).parents('.mobile-boxpage').removeClass('active');
        sidebarOverlay.removeClass('act')
        e.preventDefault();
    });
};
novtheme.HideShowPassword = function() {
    $('.hide_show_password').show();
    $('.hide_show_password span').addClass('show')
    $('.hide_show_password span').click(function(){
        if( $(this).hasClass('show')) {
            $(this).html('<i class="zmdi zmdi-eye"></i>');
            $('input[name="customer[password]"]').attr('type','text');
            $(this).removeClass('show');
        } else {
            $(this).html('<i class="zmdi zmdi-eye-off"></i>');
            $('input[name="customer[password]"]').attr('type','password');
            $(this).addClass('show');
        }
    });
    $('form button[type="submit"]').on('click', function(){
        $('.hide_show_password span').text('Show').addClass('show');
        $('.hide_show_password').parent().find('input[name="customer[password]"]').attr('type','password');
    });
    $('.login_switch').on('click', function() {
        if ($(this).hasClass('login-btn')) {
            $('.login_switch_register--toggle').css('transform', 'translate(0)');
            $('#p_login').slideDown();
            $('#p_register').slideUp();
        } else {
            if (rtl == true) {
                $('.login_switch_register--toggle').css('transform', 'translate(-100%)');
            }
            else {
                $('.login_switch_register--toggle').css('transform', 'translate(100%)');
            }
            $('#p_login').slideUp();
            $('#p_register').slideDown();
        }
    });
};
novtheme.NovSearchToggle = function() {
    searchCanvas.find('.search_trend').removeClass('hidden');
    $('.search-header__input').focus(function(){
        $(this).addClass('focus');
        if (searchCanvas.length == 0) {
            console.log('aaaaa')
            $('.search_trend').slideDown();
        }
        setTimeout(function(){
            $('.search_overlay').addClass('act');
        }, 200)
    });
    $(document).on('click', function(event) {
        if ($(event.target).is('.site-header__search input') == !1) {
            if (currentWidth > 767) {
                if (searchCanvas.length == 0) {
                    $('.search_trend').slideUp();
                }
                $('.search_overlay').removeClass('act');
            }
            if ($('.search-header__input').val().length > 0) {
                $('.search-header__input').addClass('focus');
            } else {
                $('.search-header__input').removeClass('focus');
            }
        }
    })
};
novtheme.searchTrendWidth = function () {
    var searchForms = $('form[action="/search"]').each(function() {
        var input = $(this).find('input[name="q"]');
        var searchTrend = $(this).find('.search_trend');
        var searchOverlay = $(this).find('.search_overlay');
        var Height = ($(this).parents('.header-search__parent').outerHeight() - $(this).outerHeight()) / 2;
        var offSetTrend = input.position().top + input.outerHeight() + Height;
        var offSet = input.position().top + input.innerHeight() + searchTrend.innerHeight() + Height - 10;
        var width = $(window).width();
        var offSetleft = $(this).offset().left * -1;
        if ($(this).find('.search-results__block').length == 0) {
            $('<div class="search-results__block"></div>').css({ 'position': 'absolute', 'top': offSet}).appendTo($(this)).hide();
        }
        if (currentWidth > 767) {
            searchTrend.css({'top': offSetTrend, 'width': width, 'left': offSetleft });
            $(this).find('.search-results__block').css({'width': width, 'left': offSetleft });
            searchOverlay.css({'top': offSet, 'width': width, 'left': offSetleft});

        }else{
            searchTrend.css({'top': offSetTrend, 'width': currentWidth, 'left': 0});
            $(this).find('.search-results__block').css({'width': currentWidth, 'left': 0 });
        }
    });
};
novtheme.SearchAutoComplete = function () {
    var currentAjaxRequest = null;
    var searchForms = $('form[action="/search"]').css('position','relative').each(function() {

        var input = $(this).find('input[name="q"]');
        var dataColor = $(this).data('color');
        $(this).find('.search-results__block').addClass(dataColor).append('<ul class="search-results"></ul>');
        input.attr('autocomplete', 'off').bind('keyup change', function() {
            var term = $(this).val();
            if (term.length > 0) {
                $('.btn-search__clear-text').removeClass('hide');
                $('.search-header__content .icon').hide();
                if (searchCanvas.length == 0 && currentWidth > 767) {
                    $('.search_trend').slideDown();
                }
                $('.search_overlay').addClass('act');
            } else {
                $('.btn-search__clear-text').addClass('hide');
                $('.search-header__content .icon').show();
            }
            $('.btn-search__clear-text').click(function(){
                $('.search-header__input').val('');
                $('.search-header__content .icon').show();
                $(this).addClass('hide');
            })
            var form = $(this).closest('form');
            var searchURL = '/search?type=product&q=' + term;
            var resultsListBlock = form.find('.search-results__block');
            var resultsList = form.find('.search-results');
            if (term.length > 2 && term != $(this).attr('data-old-term')) {
                $(this).attr('data-old-term', term);
                if (currentAjaxRequest != null) currentAjaxRequest.abort();
                currentAjaxRequest = $.getJSON(searchURL + '&view=json', function(data) {
                    resultsList.empty();
                    if(data.results_count == 0) {
                        // resultsList.html('<li><span class="title">No results.</span></li>');
                        // resultsList.fadeIn(200);
                        resultsListBlock.hide();
                    } else {
                        $.each(data.results, function(index, item) {
                            var link = $('<a class="text-center w-100"></a>').attr('href', item.url);
                            link.append('<div class="thumbnail"><img src="' + item.thumbnail + '" class="w-100" /></div>');
                            link.append('<div class="title">' + item.title + '</div>');
                            link.append('<div class="price price-st">' + item.price + '</div>');
                            link.wrap('<li></li>');
                            resultsList.append(link.parent());
                        });
                        if(data.results_count > 4) {
                            resultsListBlock.find('.search-see_all').remove();
                            resultsList.after('<div class="search-see_all"><a class="see_all btn" href="' + searchURL + '">' + theme.strings.results_all + ' (' + data.results_count + ')</a></div>');
                        } else {
                            resultsListBlock.find('.search-see_all').remove();
                        }
                        resultsListBlock.fadeIn(200);
                    }
                });
            }
        });
    });
    $('body').bind('click', function(){
        $('.search-results__block').hide();
    });
};
novtheme.goToTop = function() {
    $(window).scroll(function () {
        if ($(window).scrollTop() >= $(window).height()) {
            $('#_desktop_back_top').fadeIn(500);
        } else {
            $('#_desktop_back_top').fadeOut(100);
        }
    });
    $("#_desktop_back_top").click(function () {
        $("body,html").animate({scrollTop: 0}, "normal");
    });
};
novtheme.PopupNewletter = function() {
    var popupSubscribe = $("#popup-subscribe");
    var date = new Date();
    var minutes = 60;
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    if ($.cookie('popupNewLetterStatus') != 'closed' && body.outerWidth() > 768) {
        popupSubscribe.modal({
            show: !0
        });
    }
    if ($.cookie('popupNewLetterStatus') != 'closed' && popupSubscribe.data('sm') == true && responsive_mobile) {
        popupSubscribe.modal({
            show: !0
        });
    }
    $('input.no-view').change(function() {
        if ($('input.no-view').prop("checked") == 1) {
            $.cookie("popupNewLetterStatus", "closed", {
                'expires': date,
                'path': '/'
            })
        } else {
            $.cookie("popupNewLetterStatus", "", {
                'expires': date,
                'path': '/'
            })
        }
    })
    if (popupSubscribe.hasClass('promotion')) {
        popupSubscribe.click(function(){
            $.cookie("popupNewLetterStatus", "closed", {
                'expires': date,
                'path': '/'
            })
        })
    }
};
novtheme.MenuSidebar = function() {
    $('.categories__sidebar .hasSubCategory a').each(function(index) {
        if ($(this).hasClass('active')) {
            $(this).parent().children('.collapse').collapse('show');
        }
    })
};
novtheme.Nov_iframe_video = function() {
    var $videoSrc,
        modalVideo = $('#ModalVideo'),
        video = $('#video');
    $('.icon_play').click(function() {
        $videoSrc = $(this).data( "src" );
    });
    modalVideo.on('shown.bs.modal', function (e) {
        modalVideo.find('.embed-responsive').html('<iframe class="embed-responsive-item" src="'+ $videoSrc +'" id="video" allowfullscreen></iframe>');
    })
    modalVideo.on('hide.bs.modal', function (e) {
        modalVideo.find('iframe').remove();
    })
    $('.btn-video__play').each(function(){
        var id = $(this).data('id');
        $(this).click(function(){
            $(this).fadeOut();
            $('.bg-video__cover[data-id="'+ id +'"], .block-text[data-id="'+ id +'"]').fadeOut();
            $('video[data-id="'+ id +'"]').trigger('play');
        })
        if (currentWidth < 992) {
            $('video[data-id="'+ id +'"]').trigger('play');
        }
    })
    $('video').each(function(){
        var alt = $(this).data('alt');
        if (alt && alt.length) {
            $(this).find('img').attr('alt', alt);
        }
    })
};
novtheme.MegaMenuSlider = function() {
    var megaSlider = $(".megamenu-product-slider");
    var autoplay = megaSlider.data("autoplay");
    megaSlider.slick({
        autoplay: autoplay,
        autoplaySpeed: 2000,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: false,
        arrows: false,
        rtl: rtl
    });
};
novtheme.LoadmoreByButton = function(){
    var moreButon =  $('.btn_loadmore');
    var data = $(moreButon).parents('.grid--view-items');
    $(moreButon).each(function(){
        var btnHandle = $(this).attr('btn-handle');
        var nextUrl = $(this).attr("link");
        body.on('click', '.'+btnHandle+'', function(){
            $.ajax({
                url: nextUrl,
                type: 'GET',
                dataType: 'html',
                beforeSend: function() {
                    $('.'+btnHandle).addClass('loading');
                }
            }).done(function(data) {
                $('.product__loadmore-'+btnHandle).append($(data).find('.product__loadmore-'+btnHandle).html());
                var m = $('.pagination__bar'+btnHandle+'').data('max');
                var dataitem = $('.product__loadmore-'+btnHandle);
                AnimateLoadmore(dataitem);
                if ($('.AirReviews-Widget').length > 0) {
                    window.avadaAirReviewRerender();
                }
                nextUrl = $(data).find('.btn_loadmore').attr("link");
                var n = $('.product__loadmore-'+btnHandle).find('.item').length;
                $('.pagination__count'+btnHandle+' .count').text(n);
                $('.pagination__bar'+btnHandle+' .progress').css('width',  n/m*100 + '%');
                if (n < m) {
                    $('.'+btnHandle).removeClass('loading');
                } else {
                    $('.'+btnHandle).remove();
                }
            });
        });
    });
    function AnimateLoadmore (el) {
        var xxl = el.data('xxl'),
            xl = el.data('xl'),
            lg = el.data('lg'),
            md = el.data('md'),
            sm = el.data('sm'),
            xs = el.data('xs');
        el.find('.item').each(function () {
            index = $(this).index() + 1;
            if($(document).width() > 1439 ) {
                var n = xxl;
            }
            if($(document).width() < 1440 && $(document).width() > 1199 ) {
                var n = xl;
            }
            if($(document).width() < 1200 && $(document).width() > 991 ) {
                var n = lg;
            }
            if($(document).width() < 992 && $(document).width() > 767 ) {
                var n = lg;
            }
            if($(document).width() < 768 && $(document).width() > 575 ) {
                var n = sm;
            }
            if($(document).width() < 576 ) {
                var n = xs;
            }
            var modulo = Math.round(index % n * 0.3);
            $(this).attr('data-wow-duration', modulo+'s');
            if (index % n == 0) {
                var modulo0 = index % n + n *0.3;
                $(this).attr('data-wow-duration', modulo0+'s');
            } 
        });
    }
};
novtheme.Mainmenu = function() {
    $('.site-nav--btn').off('click').on('click', function() {
        var mobileMenu = $('#mobile_menu');
        if ($(this).hasClass('act')) {
            $(this).removeClass('act');
            if ($(window).width() < 1200) {
                sidebarOverlay.add(mobileMenu).removeClass('act');
            }
        } else {
            $(this).addClass('act');
            if ($(window).width() < 1200) {
                sidebarOverlay.add(mobileMenu).addClass('act');
            }
        }
        $('.mobile-btn_search, #mobile_search, .search_overlay ').removeClass('act');
    });
};
novtheme.CollectionPage = function() {
    var gridlistToggle = $('.gridlist-toggle'),
        collectionContent = $('.collection__product-content'),
        item = gridlistToggle.find('a');
    if (localStorage.getItem('view_collection')) {
        item.removeClass('active');
        if (gridlistToggle.find('[data-type="'+ localStorage.getItem('view_collection') +'"]').length > 0) {
            gridlistToggle.find('[data-type="'+ localStorage.getItem('view_collection') +'"]').addClass('active');
            collectionContent.attr('data-grid', localStorage.getItem('view_collection'));
        } else {
            gridlistToggle.find('a:first-child').addClass('active');
            collectionContent.attr('data-grid', gridlistToggle.find('a:first-child').data('type'));
        }
    }
    item.click(function(e) {
        e.preventDefault();
        var typeview = $(this).data('type');
        if (!$(this).hasClass('active')) {
            collectionContent.attr('data-grid', typeview);
            item.removeClass('active');
            $(this).addClass('active');
        }
        localStorage.setItem('view_collection', collectionContent.attr('data-grid'));
    });
    if($(window).width() <992 ) {
        collectionContent.attr('data-grid', 'grid-3');
        item.removeClass('active');
        gridlistToggle.find('#grid-3').addClass('active');
        $('.collection-topsidebar .facets__label').addClass('act')
    }
    if($(window).width() <768 ) {
        collectionContent.attr('data-grid', 'grid-2');
        item.removeClass('active');
        gridlistToggle.find('#grid-2').addClass('active');
    };
    // Click filter sort by
    var sortBy = $('[name="sort_by"]'),
        text = sortBy.find('[selected="selected"]').text(),
        val = sortBy.find('[selected="selected"]').attr('value'),
        sortbyFilter = $('[data-sortby-filter]'),
        sortbyItem = sortbyFilter.find('[data-sortby-item]');
        sortbyFilter.find('.sort-by__label').text(text);

    sortbyFilter.find('[data-value="'+ val +'"]').addClass('act');

    sortbyItem.click(function () {
        var valuesort = $(this).data('value');
        var newtext = $(this).text();
        sortbyItem.removeClass('act');
        $(this).addClass('act');
        sortbyFilter.find('.sort-by__label').text(newtext);
        sortBy.val(valuesort);
        const form = document.querySelector('collection-filter-product');
        form.onSubmitHandlerSortBy(event, form.querySelector('form'));
    });
    if (!isClickEventAttached) {
        $('.collection__category-seemore').click(function(){
            $('.collection__category-item.hide').slideToggle(300);
        });
        isClickEventAttached = true;
    }
};
novtheme.CollectionPageLoadmore = function() {
    var product_grid = $('.collection__grid-loadmore'),
        next_url = product_grid.data('next-url'),
        btnLoadmore = $('.collection__btn-loadmore');
    if (next_url) {
        btnLoadmore.click(function(){
            CollectionLoadmore();
        });
    }
    function CollectionLoadmore() {
        $.ajax (
            {
                url: next_url,
                type: 'GET',
                dataType: 'html',
                beforeSend: function(){
                    btnLoadmore.addClass('loading');
                }
            }
        ).done(function (next_page) {
            var new_page = $(next_page).find('.collection__grid-loadmore'),
                new_url = new_page.data('next-url'),
                m = $('.pagination__bar').data('max');
            next_url = new_url;
            if (typeof next_url !== "undefined") {
                btnLoadmore.removeClass('loading');
            } else {
                btnLoadmore.remove();
            }
            product_grid.append(new_page.html());
            var n = product_grid.find('.product--item').length;
            $('.pagination__count .count').text(n);
            $('.pagination__bar .progress').css('width',  n/m*100 + '%');
            if ($('.AirReviews-Widget').length > 0) {
                window.avadaAirReviewRerender();
            }
        })
    }
};
novtheme.NovAccordion = function() {
    var title = $('.nov-accordion__title'),
        content = $('.nov-accordion__content');
    title.each(function(){
        if (responsive_mobile) {
            $(this).removeClass('act');
            $(this).parent().removeClass('act').find(content).hide();
        }
        if ($(this).hasClass('act')) {
            $(this).parent().addClass('act').find(content).show();
        }
        $(this).click(function () {
            if ($(this).hasClass("act")) {
                $(this).removeClass("act");
                $(this).parent().removeClass('act').find(content).slideUp();
            } else {
                $(this).parents('.nov-accordion').find(title).removeClass('act');
                $(this).parents('.nov-accordion').find(content).slideUp();
                $(this).addClass('act');
                $(this).parents('.nov-accordion').find('.nov-accordion__item').removeClass('act');
                $(this).parent().addClass('act').find(content).slideDown()
            }
        })
    })
};
novtheme.ObserverActive = function() {
    function observeIntersection(elements) {
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                const $element = $(entry.target);
                
                if (entry.isIntersecting) {
                    $element.addClass('act');
                } else {
                    $element.removeClass('act');
                }
            });
        };
        const margin = elements.data('margin');
        const options = {
            rootMargin: margin
        };
        elements.each(function(index, element) {
            const observer = new IntersectionObserver(observerCallback, options);
            observer.observe(element);
        });
    }

    const el = $('.el-parallax');
    const el2 = $('.block__parallax');
    const el3 = $('.block-ins');

    observeIntersection(el);
    observeIntersection(el2);
    observeIntersection(el3);
};
novtheme.Parallax = function() {
    $(window).scroll(function(){
        $('.el-parallax.act').each(function(){
            var winHeight = $(window).height(),
                currentPosition = $(window).scrollTop(),
                offset_top = $(this).offset().top;
                if (currentPosition - offset_top < 0) {
                    var scrolled = (offset_top - currentPosition) * 0.1;
                    if (scrolled > 150) {
                        scrolled = 150
                    }
                    $(this).css('transform', 'translateY('+ scrolled+'px)');
                } else {
                    var scrolled = (currentPosition - offset_top) * 0.1;
                    if (scrolled > 150) {
                        scrolled = 150
                    }
                    $(this).css('transform', 'translateY(-'+ scrolled+'px)');
                }
        })
        $('.block__parallax.act').each(function(){
            var winHeight = $(window).height(),
                currentPosition = $(window).scrollTop(),
                section_id = $(this).children().data('section-id'),
                offset_top = $(this).offset().top,
                distanceY = offset_top - winHeight,
                scrolled = (currentPosition - distanceY) * 0.25,
                scrolledMax = $(this).width() - $(window).width();
                if (scrolled > scrolledMax) {
                   scrolled = scrolledMax;
                }
            $('#shopify-section-'+section_id+' .itemX_parallax').css('transform', 'translateX(-'+ scrolled+'px)');
            $('#shopify-section-'+section_id+' .reverseX_parallax').css('transform', 'translateX('+ scrolled+'px)');
        })
    });
};
novtheme.LookBook = function() {
    $('.nov-content-lookbook').each(function() {
        var el = $(this),
            $Carousel = el.find('.Lookbook__carousel'),
            btn = el.find('.lb_btn'),
            number = el.find('.number-lookbook');
        btn.click(function () {
            setTimeout(function() {
                if ($Carousel.not('.slick-initialized')) {
                    $Carousel.slick({
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        arrows: false,
                        dots: false,
                        rtl: rtl,
                        fade: true,
                    });
                }
            }, 500);
        })
        number.click(function(){
            var position = $(this).data('position');
            number.removeClass('active');
            $(this).addClass("active");
            $($Carousel).slick('slickGoTo', position);
        });
    });
    $('.Look__content').each(function(){
        var el = $(this),
            xl = el.data('xl');
        el.find('.btn_loadmore').click(function() {
            var s = el.find('.item.show').length + xl;
            el.find('.item.hide').each(function(){
                var p = $(this).data('position');
                if (p <= s) {
                    $(this).slideDown('700', 'linear').removeClass('hide').addClass('show');
                    if (el.find('.item.hide').length == 0) {
                        el.find('.btn_loadmore').parent().hide();
                        el.parents('.distance').removeClass('h_sm');
                    }
                }
            });
        })
    });
    if ($('.item-lookbook').length > 0) {
        $('.item-lookbook').each(function () {
            var el = $(this),
            el_c = $(this).children('.content-lookbook'),
            t = el.position().top,
            l = el.position().left,
            ew = el.outerWidth(),
            h = el.offsetParent().height(),
            w = el.offsetParent().width(),
            c = el_c.width();
            if (w/2 < l) {
                el_c.css('right', (ew - 40)/2 + 52).addClass('p-left');
                if (w - l + c > w) {
                    el_c.css('margin-right', (w - l + c - w) * -1)
                }
            } else {
                el_c.css('left', (ew - 40)/2 + 52).addClass('p-right');
                if (l + ew + c > w) {
                    el_c.css('margin-left', (l + ew + c - w) * -1)
                }
            }
            /*if (h/2 < t) {
                if ($(window).width > 575) {
                    el_c.css('bottom', '60px')
                } else {
                    el_c.css('bottom', '35px')
                }
            } else {
                if ($(window).width > 575) {
                    el_c.css('top', '60px')
                } else {
                    el_c.css('top', '35px')
                }
            }*/
        })
    }
};
novtheme.LanguageCountry = function() {
    $('.nov-language, .nov-country').each(function() {
        var el = $(this),
        input = el.find('input[name="locale_code"], input[name="country_code"]'),
        item =  el.find('.item');
        if (el.hasClass('flag')) {
            var flag = el.find('.active .flag-icon').html();
            el.find('.nov_ud_btn').prepend('<span class="flag-icon"></span>');
            el.find('.nov_ud_btn .flag-icon').html(flag);
        }
        item.click(function() {
            var value = $(this).data('value');
            input.val(value);
            el.submit();
        });
    });
};
novtheme.CartExtent = function() {
    var close = theme.strings.close_mini_canvas;
    $(document).on('click', '.extend--label__item', function(){
        var dataTitle = $(this).data('label'),
            item = $('.extend--label__item'),
            label = $('.cart_extend--label'),
            cartExtend = $('.cart_extend');
        if ($(this).hasClass("act")) {
            $(this).removeClass('act');
            cartExtend.removeClass('act');
            label.removeClass('act');
            $(this).attr('data-original-title', dataTitle);
        } else {
            var siblings = $(this).siblings();
            siblings.each(function () {
               var sibTitle = $(this).data('title');
               siblings.removeClass('act');
               $(this).attr('data-original-title', sibTitle);
            })
            cartExtend.removeClass('act');
            label.removeClass('act');
            $(this).addClass('act');
            $(this).attr('data-original-title', close);
            $('.cart_extend[data-content="' + dataTitle + '"]').addClass('act');
            label.addClass('act');
        }
        if (responsive_mobile) {
            $('.block_cart_canvas #desktop_cart').addClass('open-extend');
        }
    });
    $('.extend--label__item').hover(function(){
        var title = $(this).attr('title');
        if ($(this).hasClass("act")) {
            $(this).attr('data-original-title', close);
        } else {
            $(this).attr('data-original-title', title);
        }
    },function(){
        if ($(this).hasClass("act") && typeof title !== "undefined") {
            $(this).attr('data-original-title', title);
        } else {
            $(this).attr('data-original-title', close);
        }
    });
    $(document).on('click', '.cart_extend--btn', function(){
        $('.cart_extend, .cart_extend--label, .extend--label__item').removeClass('act')
        if (responsive_mobile) {
            $('.block_cart_canvas #desktop_cart').removeClass('open-extend');
        }
    });
    $(document).on('click', '.btn_save--discount', function(){
        var val = $(this).parent().find('input').val();
        $('.js-form-discount').val(val);
        $.cookie('discountCode', val, 30);
    });

    setTimeout(function() {
        var discountCode = $.cookie('discountCode');
        if (discountCode && discountCode.length) {
            $('.cart_extend--input[name="discount"]').val(discountCode);
        }
    }, 1000);
    
    if (responsive_mobile) {
        var height = $('#desktop_cart.item_count .block_cart_top').height();
        var flag = true;
        var offsetTop = 0;
        $('#desktop_cart').scroll(function() {
            var scrollTop = $('#desktop_cart').scrollTop();
            if (scrollTop > height) {
                $('#desktop_cart.item_count .block_cart_top').addClass('scroll-down');
            } else {
                $('#desktop_cart.item_count .block_cart_top').removeClass('scroll-down');
            }
            if (scrollTop < offsetTop && scrollTop > height) {
                if (flag == true) {
                    $('#desktop_cart.item_count .block_cart_top').removeClass('scroll-down').addClass('sticky-sm');
                    flag = false;
                }
            } else {
                if (flag == false) {
                    $('#desktop_cart.item_count .block_cart_top').addClass('scroll-down').removeClass('sticky-sm');
                    flag = true;
                }
            }
            offsetTop = scrollTop;
        });
    }
};
novtheme.AddActive = function() {
    $('.nov_btn_act').click(function(){
        var data = $(this).data('toggle');
        var overlay = $(this).data('overlay');
        if ($(this).hasClass('act')) {
            $(this).removeClass('act');
            $('[data-act="'+ data +'"]').removeClass('act');
            body.removeClass(''+ data +'-open');
            if (overlay == true) {
                sidebarOverlay.removeClass('act').removeAttr('data-close');
            }
        } else {
            $(this).addClass('act');
            $('[data-act="'+ data +'"]').addClass('act');
            body.addClass(''+ data +'-open');
            if (overlay == true) {
                sidebarOverlay.addClass('act').attr('data-close', data);
            }
        }
    });
    $('.nov_btn_close').click(function(){
        var data = $(this).data('close');
        $('[data-act="'+ data +'"], .sidebar-overlay, .nov_btn_act').removeClass('act');
        sidebarOverlay.removeAttr('data-close');
        body.removeClass(''+ data +'-open');
    });
    $('[data-toggle="modal"]').click(function() {
        $('.nov_btn_act, .nov_item_act').removeClass('act');
        sidebarOverlay.removeClass('act');
    })
    $('[btn-toggle]').click(function () {
        var toggle = $(this).data('toggle');
        $(this).toggleClass('act');
        $('[nov-toggle="'+ toggle +'"]').slideToggle(400);
    })
};
novtheme.ParallaxImage = function() {
    if (currentWidth > 1023) {
        $('.img_animate').each(function() {
            var el = $(this);
            el.parallax();
        });
    }
};
novtheme.BtnSlider = function() {
    $('.nov-btn-click-slider').each(function() {
        var el = $(this),
            offsetLeft = el.offset().left,
            slider = el.find('.el-slider'),
            btn = el.find('.btn-slider__el'),
            left = el.find('.active').offset().left;
            width = el.find('.active').width();
            if (rtl == true) {
                slider.css('left', left + width - offsetLeft - 26);
            } else {
                slider.css('left', left - offsetLeft);
            }
        btn.click(function(){
            btn.parent().removeClass('active');
            var n_left = $(this).parent().offset().left;
            var n_width = $(this).parent().width();
            $(this).parent().addClass('active');
            slider.css('left', n_left + n_width - offsetLeft - 26);
        })
    })
};
novtheme.CollectionTab = function() {
    $('.nav-mobile').each(function(){
        var el = $(this);
        var t = el.find('.active').text();
        var h = el.find('.nav-mobile__title');
        h.text(t);
        el.find('.nav-link').click(function(){
            h.text($(this).text());
        })
    })
    $('.nav-dropdown').each(function(){
        var el = $(this);
        var height  = 45 + $(el).find('.nav-dropdown-content').outerHeight();
        el.css('--height', height + 'px')
        el.find('.nav-dropdown-title').click(function () {
            el.toggleClass('act');
            el.find('.nav-dropdown-content').slideToggle(400);
        })
        el.find('.nav-link').click(function(){
            el.find('.nav-dropdown-title .featured-title').text($(this).text());
        })
    })
}
novtheme.NumberAnimate = function() {
    const targetElement = $('.number-animate');
    if (targetElement.length) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    targetElement.each(function () {
                        var el = $(this);
                        var delay = el.hasClass('first-load') ? 1500 : 200;

                        if (!el.hasClass('act')) {
                            el.addClass('act');
                            el.prop('number', 0).delay(delay).animate({
                                number: el.data('number')
                            }, {
                                duration: 2000,
                                easing: 'linear',
                                step: function (e) {
                                    $(this).text(Math.ceil(e));
                                }
                            });
                        }
                    });
                }
            });
        });
        targetElement.each(function() {
            observer.observe(this);
        });
    }  
};
novtheme.FakeOrder = function() {
    setTimeout(function() {
       if ($('#nov-popup-fake-order').length > 0) {
           var fakeOrder = $('#nov-popup-fake-order');
           var orderData = $('#fake-order-data');
           var closefakeOrder = fakeOrder.find('.close-popup');
           var mobile = $('#nov-popup-fake-order').data('xs');
           var date = new Date();
           var time = fakeOrder.data('time');
           date.setTime(date.getTime() + time);
           var intervalId = setInterval(function() {
             insertRandomData(fakeOrder, orderData);
           }, time);
           if ($.cookie('FakeOrder') != 'closed') {
               intervalId
           } else {
               clearInterval(intervalId);
           }
           closefakeOrder.click(function() {
               $.cookie('FakeOrder', 'closed', {expires:1, path:'/'});
               fakeOrder.removeClass('act');
               clearInterval(intervalId);
           })
           if (mobile === false && currentWidth < 576) {
              fakeOrder.remove();
           }
           function insertRandomData(fakeOrder, orderData) {
               if (fakeOrder.hasClass('act')) {
                   fakeOrder.removeClass('act')
               } else {
                   var productImage = fakeOrder.find('.product-image');
                   var productTitle = fakeOrder.find('.product-title');
                   var productTime = fakeOrder.find('.time');
                   var productName = fakeOrder.find('.name');
                   var productLocal = fakeOrder.find('.local');

                   var productItems = $(orderData).find('.product-item');
                   var randomIndex = Math.floor(Math.random() * productItems.length);
                   var randomProductItem = productItems.eq(randomIndex);
                   var imgSrc = randomProductItem.data('img');
                   var title = randomProductItem.data('title');
                   var productLink = randomProductItem.data('src');

                   var dataTime = $(orderData).find('.time-item');
                   var randomIndex = Math.floor(Math.random() * dataTime.length);
                   var randomTimeItem = dataTime.eq(randomIndex);
                   var time = randomTimeItem.data('time');

                   var dataLocal = $(orderData).find('.location-item');
                   var randomIndex = Math.floor(Math.random() * dataLocal.length);
                   var randomLocalItem = dataLocal.eq(randomIndex);
                   var local = randomLocalItem.data('local');

                   var dataName = $(orderData).find('.name-item');
                   var randomIndex = Math.floor(Math.random() * dataName.length);
                   var randomNameItem = dataName.eq(randomIndex);
                   var name = randomNameItem.data('name');

                   productImage.attr('href', productLink);
                   productImage.html('<img src="'+ imgSrc +'" alt="">');
                   productTitle.html(title).attr('href', productLink);
                   productTime.html(time);
                   productName.html(name);
                   productLocal.html(local);
                   fakeOrder.addClass('act');
                   fakeOrder.find('a').unbind();
               }
           }
       } 
    }, 5000);
};
novtheme.VerticalMenu = function() {
    var el = $(".site-nav-vertical");
    $('.btn-vertical').click(function(){
        if($(window).width() > 991 ) {
            el.slideToggle(400);
            $(this).toggleClass('act');
        } else {
            el.addClass('act');
            sidebarOverlay.addClass('act');
        }
    });
    // Show sub menu canvas tablet
    el.find('.site-nav__link--main .nav-direc').click(function(e){
        e.preventDefault();
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $(this).parents('.nav--lv1').find('.nav-dropdown--lv1').slideUp(300);
        } else {
            $('.site-nav-vertical .nav-dropdown--lv1').slideUp(300);
            $('.site-nav-vertical .site-nav__link--main .nav-direc').removeClass('active');
            $(this).addClass('active');
            $(this).parents('.nav--lv1').find('.nav-dropdown--lv1').slideDown(300);
        }
    });

    // Show sub children menu canvas tablet
    $('.site-nav-vertical .site-nav__link--second .nav-direc').click(function(e){
        e.preventDefault();
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $(this).parents('.nav--lv2').find('.nav-dropdown--lv2').slideUp(300);
        } else {
            $('.site-nav-vertical .nav-dropdown--lv2').slideUp(300);
            $('.site-nav-vertical .site-nav__link--second .nav-direc').removeClass('active');
            $(this).addClass('active');
            $(this).parents('.nav--lv2').find('.nav-dropdown--lv2').slideDown(300);
        }
    });
    if ($(window).width() < 992) {
        novtheme.swapChildren($('#desktopVerticalMenu'), $('#mobileVerticalMenu'));
    }
};
novtheme.OverlayBlur = function () {
    var hoverTimer;
    $('.nov_overlay_blur').each(function() {
        var overlayBlur = $(this);
        var respon = '';
            respon = overlayBlur.data('respon');
        if (typeof respon === 'undefined') {
            respon = 1;
        }
        if (currentWidth >= respon) {
            overlayBlur.hover(
                function() {
                    hoverTimer = setTimeout(function() {
                        $('body').append('<div class="overlay-blur"></div>');
                        var offsetTop = overlayBlur.offset().top;
                        var height = overlayBlur.outerHeight();
                        var overlayHeight = $(window).height() * 2 - offsetTop - height;
                        $('.overlay-blur').css({'height': overlayHeight, 'top': offsetTop + height});
                    }, 150);
                },
                function() {
                    clearTimeout(hoverTimer);
                    $('body').find('.overlay-blur').fadeOut(200, function() {
                        $(this).remove();
                    });
                }
            );
        }  
    });
};
novtheme.ToggleUpDown = function () {
    $('.nov_ud_toggle').each(function(){
        var el = $(this),
            btn = el.find('.nov_ud_btn'),
            dropdown = el.find('.nov_ud_dropdown'),
            group = el.find('.nov_ud_group'),
            repon = el.data('ud_respon'),
            collapse = el.data('ud_collapse');
        
        if (typeof repon !== 'undefined') {
            if ($(window).width() <= repon) {
                btn.on('click', function() {
                    var groupA = $(this).closest(group);
                    if (collapse == true) {
                       groupA.siblings().removeClass('act').find(dropdown).slideUp();
                    }
                    groupA.toggleClass('act').find(dropdown).slideToggle();
                });
            }
        } else {
            btn.on('click', function() {
                var groupA = $(this).closest(group);
                if (collapse == true) {
                   groupA.siblings().removeClass('act').find(dropdown).slideUp();
                }
                groupA.toggleClass('act').find(dropdown).slideToggle();
            });
            $(document).on("click", function(event){
                if(!$(event.target).closest(el).length){
                    el.find(dropdown).slideUp();
                }
            });
        }
    });
};
novtheme.Comparisons = function () {
    $(".content-img-compare").each(function () {
        $(this).find(".nov-before-after .nov-ba-wrap:not(.init)").each(function () {
            initBeforeAfterEl($(this).addClass("init"));
        });
    });

    function initBeforeAfterEl($container) {
        const $parentElement = $container.closest(".content-img-compare");
        const $before = $parentElement.find(".before");
        const $handle = $parentElement.find(".handle");
        const $beforeHeader = $parentElement.find(".nov-before-header");
        const $afterHeader = $parentElement.find(".nov-after-header");
        const maxX = $container.outerWidth();
        const offsetX = $container.offset().left;

        function updatePosition(clientX) {
            let curPos = ((clientX - offsetX) / maxX) * 100;
            curPos = Math.max(0, Math.min(curPos, 100));

            $before.css({ right: 100 - curPos + "%" });
            $handle.css({ left: curPos + "%" });
            //$beforeHeader.css({ opacity: 1 - (100 - curPos) / 100 });
            //$afterHeader.css({ opacity: (100 - curPos) / 100 });
        }

        function handleMove(e) {
            updatePosition(e.type.includes('touch') ? e.originalEvent.changedTouches[0].pageX : e.clientX);
        }

        function handleUp() {
            $(document).off("mousemove touchmove", handleMove).off("mouseup touchend", handleUp);
        }

        function handleDown(e) {
            updatePosition(e.type.includes('touch') ? e.originalEvent.changedTouches[0].pageX : e.clientX);
            $(document).on("mousemove touchmove", handleMove).on("mouseup touchend", handleUp);
        }

        $handle.on('ontouchstart' in window ? "touchstart" : "mousedown", handleDown);
    }
};
novtheme.MarqueeY = function() {
    $('.nov-marquee').each(function(){
        var heightBox = $(this).height();
        var heightItem = $(this).find('.block-marquee').height();
        $(this).height(heightItem);
    });
};
novtheme.TextAnimate = function() {
    const el = $('.text-animate-js');

    function observeIntersection(elements) {
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                const $element = $(entry.target);

                if (entry.isIntersecting && !$element.data('animated')) {
                    $element.data('animated', true);

                    var words = $element.text(),
                        arrayString = [words],
                        part = "",
                        offset = 0,
                        speed = 70;

                    const wordflick = function () {
                        if (offset <= arrayString[0].length) {
                            part = arrayString[0].substr(0, offset);
                            $element.text(part);
                            offset++;

                            setTimeout(wordflick, speed);
                        }
                    };

                    wordflick();
                }
            });
        };

        const margin = elements.data('margin') || "0px";
        const options = {
            rootMargin: margin
        };

        elements.each(function (index, element) {
            const observer = new IntersectionObserver(observerCallback, options);
            observer.observe(element);
        });
    }
    observeIntersection(el);
};
novtheme.BlockOverflowScroll = function() {
    const sectionContents = document.querySelectorAll('.block-overflow-scroll');

    sectionContents.forEach((sectionContent) => {
      let isDown = false;
      let startX;
      let scrollLeft;
      let isDragging = false;
      const minMoveDistance = 5;

      sectionContent.addEventListener('mousedown', (e) => {
        if (e.target.tagName.toLowerCase() === 'a' || e.target.closest('a')) {
          e.preventDefault();
        }

        isDown = true;
        isDragging = false;
        sectionContent.classList.add('active');
        startX = e.pageX - sectionContent.offsetLeft;
        scrollLeft = sectionContent.scrollLeft;
      });

      sectionContent.addEventListener('mouseleave', () => {
        isDown = false;
        sectionContent.classList.remove('active');
      });

      sectionContent.addEventListener('mouseup', () => {
        isDown = false;
        sectionContent.classList.remove('active');
        if (isDragging) {
          document.body.style.pointerEvents = 'none';
          setTimeout(() => {
            document.body.style.pointerEvents = '';
          }, 200);
        }
      });

      sectionContent.addEventListener('mousemove', (e) => {
        if (!isDown) return;

        e.preventDefault();

        const x = e.pageX - sectionContent.offsetLeft;
        const walk = x - startX;

        if (Math.abs(walk) >= minMoveDistance) {
          isDragging = true;
          sectionContent.scrollLeft = scrollLeft - walk;
        }
      });

      const links = sectionContent.querySelectorAll('a');
      links.forEach((link) => {
        link.addEventListener('click', (e) => {
          if (isDragging) {
            e.preventDefault();
          }
        });
      });
    });
}
$(document).ready(function() {
    $(novtheme.init);
    var timer = false;
    $(window).on('resize', function() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(function(){
            novtheme.CollectionPage();
            novtheme.toggleMobileStyles();
            novtheme.load_canvas_menu();
            novtheme.searchTrendWidth();
            if ($(window).width() > 575) {
                $('.block_footer').find('.block-content.h_t').slideDown(300);
                $('.f_btn_sl').removeClass('active'); 
            } else {
                $('.block_footer').find('.block-content.h_t').slideUp(300);
            }
        }, 300);
    });
    if ($("#popup-subscribe").length) {
        $(window).on('load', function() {
            setTimeout(function() {
                novtheme.PopupNewletter();
            }, 2000);
        });
    }
    if ($("#popupAlert").length) {
        $(window).on('load', function() {
            $('#popupAlert').modal();
        });
        $("#popupAlert").click(function(){
            const url = window.location.href;
            const questionMarkIndex = url.indexOf('?customer');
            if (questionMarkIndex !== -1) {
                const previousLink = url.slice(0, questionMarkIndex);
                history.pushState({}, '', previousLink);
            }
        })
    }

    sidebarOverlay.on('click', function() {
        $(this).removeClass('act');
        var data = $(this).data('close');
        $('.cart_extend, .cart_extend--label, #mobile_menu, #show-megamenu, .site-nav--btn, .nov_item_act, .nov_btn_act, #mobileVerticalMenu .site-nav-vertical').removeClass('act');
        $("#desktop_cart, #AccessibleNav").removeClass('active');
        body.css('overflow', 'auto').removeClass('open-canvans-cart, '+ data +'-open');
        body.removeClass('overflow_hidden');
        $(this).removeAttr('data-close');
        $('.extend--label__item').removeClass('act').each(function() {
            var title = $(this).data('title');
            $(this).attr('data-original-title', title);
        });
    });

    // Animate load wislist page detail
    $('.group-quantity .btnProductWishlist').click(function () {
        if($(this).hasClass('whislist-added')) {
            $('#popup-Wishlist').removeClass('novload')
        } else {
            $('#popup-Wishlist').addClass('novload')
        }
    })
    
    // Zoom Product Image Page Detail
    function ZoomProductImage(elements) {
        const currentWidth = window.innerWidth;
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                const $element = $(entry.target);
                if (entry.isIntersecting) {
                    if (currentWidth >= 992) {
                        const alt = $element.find('img').attr('alt');
                        try {
                            $element.trigger('zoom.destroy');
                        } catch (error) {
                            console.warn('Zoom destroy failed:', error);
                        }
                        $element
                            .wrap('<span class="w-100" style="display:block"></span>')
                            .css('display', 'block')
                            .parent()
                            .zoom({
                                url: $element.attr('data-zoom')
                            });
                        setTimeout(() => {
                            $element.parents('.item-content').find('.zoomImg').attr('alt', alt);
                        }, 500);
                    }
                    observer.unobserve(entry.target);
                }
            });
        };
        elements.each(function (index, element) {
            const observer = new IntersectionObserver(observerCallback);
            observer.observe(element);
        });
    }

    const el = $('.image-zoom');
    ZoomProductImage(el);

    // Form newletter product soldout
    $('.no-view').click(function () {
        if($('.contact-form').hasClass('add')) {
            $('.contact-form').removeClass('add')
        } else {
            $('.contact-form').addClass('add')
        }
    });

    // Accordion footer mobile
    if ($(window).width() < 768) {
        $(".f_btn_sl").parents('.block_footer').find('.block-content').removeClass('wow');
    } 
    $(".f_btn_sl").click(function(e) {
        if ($(this).hasClass("active")) {
            $(this).removeClass('active');
            $(this).parents('.block_footer').find('.block-content.h_t').slideUp(300);
        } else {
            $(".f_btn_sl").removeClass('active');
            $('.block_footer .block-content.h_t').slideUp(300);
            $(this).addClass('active');
            $(this).parents('.block_footer').find('.block-content.h_t').slideDown(300);
        }
    });

    $(".faqs-main .panel-header").click(function(e) {
        if ($(this).hasClass("collapsed")) {
            $(".faqs-main").removeClass('active');
            $(this).parents('.faqs-main').addClass('active');
        } else {
            $(this).parents('.faqs-main').removeClass('active');
        }
    });

    $('.promotion-close').click(function () {
        $('[promationBar]').slideUp(300).removeClass('act');
    })

    new WOW().init();

})