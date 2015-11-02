function injectRAScript() {
    (function () {
        var rs = window.rs || (window.rs = {});
        if (!rs.loaded) {
            var rsScript = document.createElement('script');
            rsScript.async = true;
            rsScript.src = 'http://richanchor.com/rs-cdn/rs.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(rsScript, s);
            rs.loaded = true;
        }
    })();
}

window.onload = function () {
    var template = '';
    template += '<div data-rs class="sectionMain similarThreadsThreadView ThreadView">';
    template += '    <h4 class="heading">Có thể bạn sẽ quan tâm</h4>';
    template += '    <script type="text/template">';
    template += '        <ul class="dataTable" data-rs-list>';
    template += '            <li class="dataRow">';
    template += '                <div class="listThreadView">';
    template += '                    <div class="titleThreadView"><a sl-processed="1" href="{{url}}" title="{{title}}">{{title}}</a></div>';
    template += '                 </div>';
    template += '            </li>';
    template += '        </ul>';
    template += '    </script>';
    template += '</div>';

    var target = document.querySelectorAll('.similarThreadsThreadView')[0];
    if (target) {
        var parent = target.parentNode;
        var richanchorElement = document.createElement('div');
        richanchorElement.innerHTML = template;
        parent.insertBefore(richanchorElement, target);
        parent.removeChild(target);
    }

    injectRAScript();
};
