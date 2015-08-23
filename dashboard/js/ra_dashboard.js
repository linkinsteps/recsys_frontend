window.console = window.console || function (t) {};
var barCharts = {};
var lineCharts = {};

if (document.location.search.match(/type=embed/gi)) {
    window.parent.postMessage('resize', '*');
}

function initDataSwitcher() {    
    var dataSwitcher = $('#data-switcher');
    var dataWrappers = $('.data-wrapper');

    dataSwitcher.on('change', function () {
        dataWrappers.hide();

        var targetId = this.value;
        var target = $('#' + targetId);
        target.show();

        var activePane = target.find('.tab-pane.active');
        if (activePane.length === 0) {
            target.find('.nav-tabs li:first a').tab('show');
        }

    }).trigger('change');
}

function initBarChart(targetId, data) {
    var config = {
        data: data,
        xkey: 'y',
        ykeys: [
            'a',
            'b'
        ],
        labels: [
            'RS click',
            'All click'
        ],
        hideHover: 'auto',
        barColors: [
            '#FFAD33',
            '#00527A'
        ],
        resize: false,
        element: targetId
    };
    Morris.Bar(config);
}

function initLineChart(targetId, data) {
    var config = {
        data: data,
        xkey: 'y',
        ykeys: [
            'a'
        ],
        labels: [
            'Total users'
        ],
        hideHover: 'auto',
        lineColors: [
            '#FFAD33'
        ],
        resize: false,
        element: targetId
    };
    Morris.Line(config);
}

function initChartRenderer() {
    $('[data-toggle=tab]').each(function () {
        var tabToggle = $(this);
        var href = tabToggle.attr('href').replace('#', '');
        var isBarChart = href.indexOf('-clickrate') !== -1;
        var chartName = '';
        if (isBarChart) {
            chartName = href.replace('-clickrate', '');
        } else {
            chartName = href.replace('-totalusers', '');
        }

        tabToggle.on('shown.bs.tab', function () {
            var isInitChart = tabToggle.attr('data-init') === 'yes';

            if (!isInitChart) {
                if (isBarChart) {
                    barCharts[chartName]();
                } else {
                    lineCharts[chartName]();
                }

                tabToggle.attr('data-init', 'yes');
            }
        });
    }); 
}

$(function () {
    initChartRenderer();
    initDataSwitcher();
});
