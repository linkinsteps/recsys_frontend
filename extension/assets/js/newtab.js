(function ($) {
    var RICHANCHOR_COMPOSITOR_HREF = 'http://richanchor.com/compositor/';

    var log = function () {
        if (console && console.log && typeof console.log === 'function') {
            var args = [];
            args.push.apply(args, arguments);
            args.unshift('[RichAnchor]');

            console.log(args);
        }
    };

    function init3NewsPanel() {
        log('init3NewsPanel');

        $.ajax({
            url: RICHANCHOR_COMPOSITOR_HREF,
            data: {
                f: 'json',
                site: 'newtab',
                demo: 1
            },
            jsonp: false,
            success: function (resp) {
                log('Success on getting recommendation from server', resp);

                if (resp && resp.outputs && resp.outputs.length > 0) {
                    render3NewsPanel(resp.outputs);
                } else {
                    log('There is no recommendation from server');
                }
            },
            error: function (resp) {
                log('Error on getting recommendation from server', resp);
            }
        });
    }

    function render3NewsPanel(data) {
        log('render3NewsPanel', data);

        var topString = '';
        var relatedString = '';
        var categoryString = '';

        for (var i = 0; i < data.length; i++) {
            if (data[i].type === 'top') {
                topString = renderRec(data[i].recs);
            }

            if (data[i].type === 'related') {
                relatedString = renderRec(data[i].recs);
            }

            if (data[i].type === 'category') {
                categoryString = renderRec(data[i].recs);
            }
        }

        $('#top').html(topString);
        $('#related').html(relatedString);
        $('#category').html(categoryString);
    }

    function renderRec(recs) {
        log('renderRec', recs);

        var recsString = '';

        for (var i = 0; i < recs.length; i++) {
            var rec = recs[i];

            recsString += '<li>';
            recsString += '<a href="' + rec.url + '" title="' + rec.title + '">' + rec.title + '</a>';
            recsString += '</li>';
        }

        return recsString;
    }

    $(function () {
        init3NewsPanel();
    });

})(jQuery);
