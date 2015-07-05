var win = $(window);

$(function () {
	win.on('resize', function () {
		var homeBanner = $('.home-banner');
		var winHeight = win.height();

		homeBanner.css('height', winHeight);
	}).trigger('resize');

	var navbar = $('#rs-navbar');
	win.on('scroll', function () {
		navbar[win.scrollTop() > 0 ? 'addClass' : 'removeClass']('navbar-white');
	}).trigger('scroll');
});