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

    function countLeadingSpaces(string) {
        var index = 0;

        while (index < string.length && string.charAt(index) === ' ') {
            index += 1;
        }

        return index;
    }

    function removeLeadingSpace(strMultiLineText) {

        var lines = strMultiLineText.replace(/\r\n|\n\r|\n|\r/g,"\n").split("\n"),
            nFirstLineLeadingSpaces = countLeadingSpaces(lines[0]),
            sbResult = [];

        $.each(
            lines,
            function(idx, line) {
                sbResult.push(line.substring(nFirstLineLeadingSpaces));
            }
        );

        return sbResult.join("\n");

    }

    $.fn.codeExample = function() {

        return this.each(function () {

            var sourceUrl = $(this).attr("data-sourceUrl");

            if (!sourceUrl) {

                var jqOriginalElement = $(this),
                    jqNewElement,
                    txtOriginalElementSource = jqOriginalElement.val(),
                    formattedSource;

                txtOriginalElementSource = removeLeadingSpace(txtOriginalElementSource);

                if (Prism) {
                    formattedSource =
                        Prism.highlight(txtOriginalElementSource, Prism.languages.markup);

                } else {
                    formattedSource = escapeHtml(txtOriginalElementSource).
                        replace(/\n/g, '<br\>').
                        replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').
                        replace(/ /g, '&nbsp;');
                }

                jqNewElement = $("<code>" + formattedSource + "</code>");
                jqNewElement.attributes = jqOriginalElement.attributes;
                $.each(
                    jqOriginalElement.prop("attributes"),
                    function() {
                        jqNewElement.attr(this.name, this.value);
                    }
                );
                jqOriginalElement.after(jqNewElement);
                jqOriginalElement.remove();

            } else {

                var domElement = this,
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
                        '<div class="preWrapper"><pre></pre></div>' +
                        '<button></button>' +
                        '</div>'
                    );

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

            }

        });

    };

} (jQuery));