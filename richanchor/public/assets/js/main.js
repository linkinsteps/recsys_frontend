var win = $(window);

$(function () {
    initFullHeightPanel();
    initNavbar();
    initGotoLink();
    initContactForm();
});

function initFullHeightPanel() {
    win.on('resize', function () {
        var fullHeight = $('.full-height');
        var winHeight = win.height();

        fullHeight.css('height', winHeight);
    }).trigger('resize');
}

function initNavbar() {
    var navbar = $('#rs-navbar');

    win.on('scroll', function () {
        var winTop = win.scrollTop();
        navbar[winTop > 0 ? 'addClass' : 'removeClass']('navbar-white');
    }).trigger('scroll');

    var menu = $('#rs-navbar-collapse');
    $('.navbar-toggle').on('click', function (e) {
        if (menu.hasClass('in')) {
            navbar.removeClass('opened-menu');
        } else {
            navbar.addClass('opened-menu');
        }
    });
}

function initGotoLink() {
    var navbar = $('#rs-navbar');
    var navbarHeight = navbar.innerHeight();

    $('.goto-link').each(function () {
        var link = $(this);

        link.on('click', function (e) {
            e.preventDefault();

            var target = $(href);
            var top = target.offset().top - navbarHeight;

            $('html, body').animate({
                scrollTop: top
            }, 300);
        });
    });
}

function disableContactForm(form) {
    form.find('input, textarea, select, button').prop('disabled', true);
    form.addClass('disabled');
}

function enableContactForm(form) {
    form.find('input, textarea, select, button').prop('disabled', false);
    form.removeClass('disabled');
}

function initContactForm() {
    var form = $('#form-contact');
    var thanks = $('#thanks');

    form.on('submit', function (e) {
        e.preventDefault();
        
        var pattern = new RegExp(/^(("[\w-\s]+")|([\w-'']+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
        var error = 0;
        
        var txtName = $('#name');
        var name = txtName.val().trim();
        var nameWrapper = txtName.closest('.form-group');

        var txtEmail = $('#email');
        var email = txtEmail.val().trim();
        var emailWrapper = txtEmail.closest('.form-group');

        var txtPhone = $('#phone');
        var phone = txtPhone.val().trim();

        var txtOrganization = $('#org');
        var org = txtOrganization.val().trim();

        var txtMsg = $('#msg');
        var msg = txtMsg.val().trim();
        var msgWrapper = txtMsg.closest('.form-group');

        if (name.length === 0) {
            nameWrapper.addClass('has-error');
            error++;
        } else {
            nameWrapper.removeClass('has-error');
        }

        if (email.length === 0 || !pattern.test(email)) {
            emailWrapper.addClass('has-error');
            error++;
        } else {
            emailWrapper.removeClass('has-error');
        }

        if (msg.length === 0) {
            msgWrapper.addClass('has-error');
            error++;
        } else {
            msgWrapper.removeClass('has-error');
        }

        if (error === 0 && !form.hasClass('disabled')) {
            disableContactForm(form);

            $.ajax({
                url: form.attr('action'),
                method: form.attr('method'),
                data: {
                    name: name,
                    email: email,
                    phone: phone,
                    org: org,
                    msg: msg
                },
                success: function (resp) {
                    enableContactForm(form);

                    if (resp && resp.status) {
                        form.animate({
                            opacity: 0,
                            height: 'hide'
                        }, 500);

                        thanks.animate({
                            opacity: 1,
                            height: 'show'
                        }, 500);
                    } else {
                        alert('Error when contacting. Please kindly contact us via richanchor.com@gmail.com manually!')
                    }
                },
                error: function () {
                    enableContactForm(form);
                    alert('Error when contacting. Please kindly contact us via richanchor.com@gmail.com manually!')
                }
            })
        }
    });
}
