(function ($) {

    function openPopup(url, title, width, height) {
        var left = (screen.width / 2) - (width / 2);
        var top = (screen.height / 2) - (height / 2);
        return window.open(
            url,
            title,
            'toolbar=no, location=no, directories=no, status=no, menubar=no, ' +
                'scrollbars=yes, resizable=no, copyhistory=no, ' +
                'width=' + width + ', height=' + height +
                ', top=' + top + ', left=' + left
        );
    }

    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }

    $.fn.codeExample = function (url) {

        return this.each(function() {
            var domElement = this,
                sourceUrl = $(domElement).attr("data-sourceUrl"),
                formattedSource,
                preElement,
                buttonElement;

            $.get(sourceUrl, null, function (data) {

                if (Prism) {
                    formattedSource = Prism.highlight(data, Prism.languages.markup);
                } else {
                    formattedSource = escapeHtml(data).
                        replace(/\n/g, '<br\>').
                        replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').
                        replace(/ /g, '&nbsp;');
                    console.log(formattedSource);
                }

                $(domElement).html(
                    '<div class="example">' +
                        '<pre></pre>' +
                        '<button></button>' +
                    '</div>'
                );

                $(domElement).addClass("example");

                preElement = $(domElement).find("pre");
                preElement.html(formattedSource);

                buttonElement = $(domElement).find("button");
                buttonElement.append(
                    '<span class="glyphicon glyphicon-play"></span> Play'
                );
                buttonElement.addClass("btn");
                buttonElement.addClass("btn-primary");
                buttonElement.addClass("pull-right");
                buttonElement.click(function () {
                    openPopup(sourceUrl, "Example", 650, 450);
                });

            }, "text");

        });

    };

} (jQuery));