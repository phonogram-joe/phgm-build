(function($){
	var $win = $(window)
		, $nav = $('.subnav')
		, navHeight = $('.navbar').first().height()
		, navTop = $('.subnav').length && $('.subnav').offset().top - navHeight
		, isFixed = 0;

	processScroll();

	$win.on('scroll', _.debounce(processScroll, 50));

	function processScroll() {
		var i, 
			scrollTop = $win.scrollTop();
		if (scrollTop >= navTop && !isFixed) {
			isFixed = 1;
			$nav.addClass('subnav-fixed');
		} else if (scrollTop <= navTop && isFixed) {
			isFixed = 0;
			$nav.removeClass('subnav-fixed');
		}
	}

	function appendImage() {
		var img = new Image();
		img.src = '/inc/images/bootstrap/glyphicons-halflings.png?hello=world!';

		$('body').append(img);
	}
})(jQuery);