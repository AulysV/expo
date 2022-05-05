(function ($) {
    "use strict";
    var $window = $(window),
        $body = $('body'),
        settings = {
            parallax: true,
            speed: 1250
        };
    breakpoints({
        xlarge: ['1281px', '1680px'],
        large: ['981px', '1280px'],
        medium: ['737px', '980px'],
        small: ['481px', '736px'],
        xsmall: ['361px', '480px'],
        xxsmall: [null, '360px']
    });
    $window.on('load', function () {
        window.setTimeout(function () {
            $body.removeClass('is-preload');
        }, 100);
    });
    var $form = $('form');
    $('input,textarea,select').on('keydown', function (event) {
        event.stopPropagation();
    });
    $form.placeholder();
    if (browser.mobile) $body.addClass('is-touch');
    (function () {
        var $nav = $('#nav'),
            $navItems = $nav.find('> ul > li'),
            $main = $('#main'),
            $reel = $main.children('.reel'),
            $slides = $reel.children('.slide'),
            $controls = $('<nav><span class="previous"></span><span class="next"></span></nav>').appendTo($main),
            $next = $controls.children('.next'),
            $previous = $controls.children('.previous'),
            pos = 0,
            locked = false;
        var switchTo = function (newPos, instant) {
            var $slide, $navItem, left;
            if (newPos < 0 || newPos >= $slides.length) return;
            if (instant !== true) {
                if (locked) return;
                locked = true;
            }
            pos = newPos;
            left = $slides.width() * pos;
            $navItems.removeClass('active');
            $navItem = $navItems.eq(pos);
            $navItem.addClass('active');
            $slides.removeClass('active');
            $slide = $slides.eq(pos);
            $slide.addClass('active');
            history.replaceState(null, null, (pos == 0 ? '#' : '#' + $slide.attr('id')));
            if (pos == 0) $previous.addClass('disabled');
            else $previous.removeClass('disabled');
            if (pos == $slides.length - 1) $next.addClass('disabled');
            else $next.removeClass('disabled');
            if (instant !== true) {
                $main.animate({
                    scrollLeft: left
                }, settings.speed, 'swing', function () {
                    locked = false;
                });
            } else $main.scrollLeft(left);
        };
        $reel.css('width', (100 * $slides.length) + 'vw');
        $slides.each(function () {
            var $this = $(this),
                $img = $this.children('img'),
                id = $this.attr('id'),
                position = $img.data('position'),
                bg = {
                    image: $this.css('background-image'),
                    size: $this.css('background-size'),
                    position: $this.css('background-position'),
                    repeat: $this.css('background-repeat'),
                    attachment: $this.css('background-attachment')
                },
                x;
            $this.data('index', $this.index()).attr('data-index', $this.index());
            $this.css('background-image', (bg.image ? bg.image + ',' : '') + 'url("' + $img.attr('src') + '")')
                .css('background-size', (bg.size ? bg.size + ',' : '') + 'cover').css('background-position', (bg
                    .position ? bg.position + ',' : '') + '0% 50%').css('background-repeat', (bg.repeat ? bg.repeat +
                    ',' : '') + 'no-repeat').css('background-attachment', (bg.attachment ? bg.attachment + ',' : '') +
                    'fixed');
            if (browser.name == 'ie') {
                x = $this.css('background-image');
                $this.css('background-image', x.replace($img.attr('src'), 'invalid'));
                window.setTimeout(function () {
                    $this.css('background-image', x);
                }, 100);
            }
            $img.hide();
            $body.on('click', 'a[href="#' + id + '"]', function (event) {
                event.preventDefault();
                event.stopPropagation();
                switchTo($this.index());
            });
            if (settings.parallax) $main.on('scroll', function () {
                if (breakpoints.active('<=large') || browser.mobile || !browser.canUse('transition') || $window
                    .prop('orientation') == 0 || $window.prop('orientation') == 180 || $window.width() < $window
                    .height()) {
                    if (position) $this.css('background-position', (bg.position ? bg.position + ',' : '') +
                        position);
                    else $this.css('background-position', (bg.position ? bg.position + ',' : '') + '0% 50%');
                } else {
                    var l = $this.width() * $this.index(),
                        sl = $main.scrollLeft(),
                        w = $this.width(),
                        p = ((sl - l) / w);
                    $this.css('background-position', (bg.position ? bg.position + ',' : '') + (p * 100) +
                        '% 50%');
                }
            });
        });
        $next.on('touchmove', function (event) {
            event.stopPropagation();
            event.preventDefault();
        }).on('click', function (event) {
            switchTo(pos + 1);
        });
        $previous.on('touchmove', function (event) {
            event.stopPropagation();
            event.preventDefault();
        }).on('click', function (event) {
            switchTo(pos - 1);
        });
        $window.on('keydown', function (event) {
            var newPos = null;
            switch (event.keyCode) {
                case 36:
                    newPos = 0;
                    break;
                case 35:
                    newPos = $slides.length - 1;
                    break;
                case 37:
                    newPos = pos - 1;
                    break;
                case 32:
                case 39:
                    newPos = pos + 1;
                    break;
            }
            if (newPos !== null) {
                event.stopPropagation();
                event.preventDefault();
                switchTo(newPos);
            }
        }).on('resize orientationchange', function () {
            setTimeout(function () {
                switchTo(pos, true);
            }, 0);
        }).on('load', function () {
            setTimeout(function () {
                var h, $slide;
                $window.triggerHandler('resize');
                h = location.hash;
                if (h && ($slide = $slides.filter('[id="' + h.substr(1) + '"]')).length > 0) pos = $slide.data(
                    'index');
                switchTo(pos, true);
            }, 0);
        });
        if (settings.parallax) $window.on('resize', function () {
            $main.triggerHandler('scroll');
        });
    })();
})(jQuery);