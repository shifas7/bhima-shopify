Shopify.Products.showRecentlyViewed({
  howManyToShow: $('#recently-viewed-products').data('limit'),
  wrapperId: 'recently-viewed-products',
  templateId: 'recently-viewed-product-template',
  onComplete: function() {
    if ($('html').hasClass('lang-rtl')) {
      var rtl = true
    } else {
      var rtl = false
    }
    if(!$('#recently-viewed-products').hasClass('slick-initialized')) {
      $('#recently-viewed-products').slick({
          nextArrow: '<div class="arrow-next"><i class="zmdi zmdi-chevron-right"></i></div>',
          prevArrow: '<div class="arrow-prev"><i class="zmdi zmdi-chevron-left"></i></div>',
          slidesToShow: $('#recently-viewed-products').data('xxl'),
          slidesToScroll: $('#recently-viewed-products').data('xxl'),
          dots: false,
          arrows: false,
          rtl: rtl,
          responsive: [
            {
              breakpoint: 1441,
              settings: {
                slidesToShow: $('#recently-viewed-products').data('xl'),
                slidesToScroll: $('#recently-viewed-products').data('xl')
              }
            },
            {
              breakpoint: 1200,
              settings: {
                slidesToShow: $('#recently-viewed-products').data('lg'),
                slidesToScroll: $('#recently-viewed-products').data('lg')
              }
            },
            {
              breakpoint: 992,
              settings: {
                slidesToShow: $('#recently-viewed-products').data('md'),
                slidesToScroll: $('#recently-viewed-products').data('md'),
                arrows: false,
              }
            },
            {
              breakpoint: 768,
              settings: {
                slidesToShow: $('#recently-viewed-products').data('sm'),
                slidesToScroll: $('#recently-viewed-products').data('sm')
              }
            },
            {
              breakpoint: 576,
              settings: {
                  slidesToShow: $('#recently-viewed-products').data('xs'),
                  slidesToScroll: $('#recently-viewed-products').data('xs')
              }
            }
          ]
      });
    }
    if ($('.AirReviews-Widget').length > 0) {
      window.avadaAirReviewRerender();
    }
  }
});
Shopify.Products.recordRecentlyViewed();