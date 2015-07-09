var win = $(window);

$(function () {
    win.on('resize', function () {
        var fullHeight = $('.full-height');
        var winHeight = win.height();

        fullHeight.css('height', winHeight);
    }).trigger('resize');

    var navbar = $('#rs-navbar');
    var navbarHeight = navbar.innerHeight();
    win.on('scroll', function () {
        var winTop = win.scrollTop();
        navbar[winTop > 0 ? 'addClass' : 'removeClass']('navbar-white');
    }).trigger('scroll');

    var navbarItem = $('.navbar-nav li');
    navbarItem.on('click', function (e) {
        e.preventDefault();

        var li = $(this);
        var a = li.children('a');
        var href = a.attr('href');
        var target = $(href);
        var top = target.offset().top - navbarHeight;
        li.addClass('active');
        navbarItem.not(li).removeClass('active');

        $('html, body').animate({
            scrollTop: top
        }, 300);
    });
});
