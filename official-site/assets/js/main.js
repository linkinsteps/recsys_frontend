var win = $(window);

$(function () {
	win.on('resize', function () {
		var fullHeight = $('.full-height');
		var winHeight = win.height();

		fullHeight.css('height', winHeight);
	}).trigger('resize');

	var navbar = $('#rs-navbar');
	win.on('scroll', function () {
		navbar[win.scrollTop() > 0 ? 'addClass' : 'removeClass']('navbar-white');
	}).trigger('scroll');
});