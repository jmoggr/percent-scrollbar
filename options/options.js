
(function () {
    var port;
    var initialized = false;

	const RESETMESSAGE = 'Restore Default Settings?';

	function reset_options() {
		if (!window.confirm(RESETMESSAGE)) {
            return;
        }

        set_option_inputs(DEFAULT_OPTIONS);

    	port.postMessage({
        	options: DEFAULT_OPTIONS
    	});
	}

    function on_recv_msg(msg) {
        if (initialized) {
            return;
        }

       	initialized = true;
    	let option_containers = document.querySelectorAll("label[for].option-input");
    	for (var option_container of option_containers) {
    		let option_key = option_container.getAttribute('for');
    		if (option_key in OPTIONS_META) {
    			create_option_input(option_container, port, OPTIONS_META[option_key], msg.options[option_key]);
    		}
    	}
    }

    on_dom_ready(() => {
        port = browser.runtime.connect(undefined, { name: 'ADDON_PREFERENCES' });
        port.onMessage.addListener(on_recv_msg);

        var reset_button = document.getElementById('reset-button');
        reset_button.addEventListener('click', reset_options);
    });
})();
