// document.body.style.border = '5px solid red';
//http://www.javascriptkit.com/javatutors/detect-user-scroll-amount.shtml
//https://remysharp.com/2010/07/21/throttling-function-calls
//https://stackoverflow.com/a/23981970

// https://stackoverflow.com/a/14744331
function get_total_height() {
    var B = document.body,
        H = document.documentElement,
        height

    if (typeof document.height !== 'undefined') {
        height = document.height // For webkit browsers
    } else {
        height = Math.max( B.scrollHeight, B.offsetHeight, H.clientHeight, H.scrollHeight, H.offsetHeight );
    }

    return height;
}

function get_percent_scrolled()
{
    var window_height = window.innerHeight;
    var document_height = get_total_height();
    var track_length = document_height - window_height;
    var scrollTop = window.pageYOffset;

    // If the page is tall enough to be scrolled
    if(document_height > window_height)
    {
        return Math.floor(scrollTop / track_length * 100);
    // The full height of the page is already displayed and cannot
    // be scrolled
    } else {
        return 100;
    }
}

function get_percent_viewed() {
    var window_height = window.innerHeight;
    var document_height = get_total_height();
    var scrollTop = window.pageYOffset;

    // If the page is tall enough to be scrolled
    if(document_height > window_height)
    {
        // return Math.floor(scrollTop/track_length * 100); 
        return Math.floor((window_height + scrollTop) / document_height * 100);

    // The full height of the page is already displayed and cannot
    // be scrolled
    } else {
        return 100;
    }
}

function PercentScrollbar()
{
	var port;
	var options;
    var display_div;
    var autohide_timeout;
    var stylesheet;

    function update(event) {
        if((typeof options === 'undefined') || !options.showpercentage) {
            return;
        }

        clearTimeout(autohide_timeout);
        autohide_timeout = setTimeout(minimize, options.transitiondelay);

        set_percent();

        maximize();
    }

    function set_percent() {
        if(typeof options === 'undefined') {
            return;
        }

        var percent = 0;
        if(options.percentviewed) {
            percent = get_percent_viewed();
        } else {
            percent = get_percent_scrolled();
        }

        display_div.innerText = percent + '%';
    }

    function maximize() {
        display_div.classList.add('maximized');
    }

    function minimize() {
        display_div.classList.remove('maximized');
    }

    function on_recv_msg(msg) {
		options = msg.options;

		while (stylesheet.cssRules.length > 0) {
    		stylesheet.deleteRule(stylesheet.cssRules.length - 1);
		}

		if (!options.showpercentage) {
    		display_div.classList.add('hidden');
    		return;
		}

        stylesheet.insertRule(`
                div#percent-scrollbar-display {
                transition: all ${options.transitiontime}ms ease;
                font-size: ${options.minfontsize}px;
            }`,
            stylesheet.cssRules.length);

        stylesheet.insertRule(`
            div#percent-scrollbar-placeholder {
                font-size: ${options.minfontsize}px;
            }`,
            stylesheet.cssRules.length);

		if (options.hideafterscroll) {
            stylesheet.insertRule(`
                div#percent-scrollbar-display {
                    visibility: hidden;
                    opacity: 0;
                    transition: all ${options.transitiontime}ms ease;
                }`,
            	stylesheet.cssRules.length);
		}

		if (options.maximizeonscroll) {
            stylesheet.insertRule(`
                div#percent-scrollbar-display.maximized {
                    visibility: visible;
                    opacity: 1;
                    transition: all ${options.transitiontime}ms ease;
                    font-size: ${options.maxfontsize}px;
                }`,
                stylesheet.cssRules.length);
		}

		if (options.hideafterscroll && !options.maximizeonscroll) {
            stylesheet.insertRule(`
                div#percent-scrollbar-display.maximized {
                    visibility: visible;
                    opacity: 1;
                }`,
                stylesheet.cssRules.length);
		}

        display_div.style.paddingRight = options.rightpadding + 'px';
		display_div.classList.remove('hidden');

        set_percent();
    }

    (function init() {
        port = browser.runtime.connect(undefined, { name: 'CONTENT_SCRIPT' });
        port.onMessage.addListener(on_recv_msg);

        let wrapper_div = document.createElement('div');
        wrapper_div.id = 'percent-scrollbar-wrapper';

        let placeholder_div = document.createElement('div');
        placeholder_div.id = 'percent-scrollbar-placeholder';

        display_div = document.createElement('div');
        display_div.id = 'percent-scrollbar-display';
        display_div.classList.add('hidden');

        wrapper_div.appendChild(display_div);
        wrapper_div.appendChild(placeholder_div);
        document.body.appendChild(wrapper_div);

        var style = document.createElement('style');
        document.head.appendChild(style);
        stylesheet = style.sheet;

        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update, false);
    })();
}

(function () {
	if (window.hasRun) {
    	return;
	}

    window.hasRun = true;

    if(!is_iframe()) {
        on_dom_ready(PercentScrollbar);
    }
})();
