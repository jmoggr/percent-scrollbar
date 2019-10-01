function reportExecuteScriptError(error) {
    document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    console.error(`Failed to execute beastify content script: ${error.message}`);
}

var initialized = false;

var port = browser.runtime.connect(undefined, { name: 'ACTION_POPUP' });

function on_recv_msg(msg) {
    if (initialized) {
        return;
    }

   	initialized = true;

    if ('error' in msg) {
    	document.querySelector("#error-content").classList.remove("hidden");
    	document.querySelector("#error-msg").innerText = msg.error;
    	return;
    }

	let popup_options = document.querySelectorAll("label[for].option-input");
	for (var popup_option of popup_options) {
		let option_key = popup_option.getAttribute('for');
		if (option_key in OPTIONS_META) {
			create_option_input(popup_option, port, OPTIONS_META[option_key], msg.options[option_key]);
		}
	}

	document.querySelector("#popup-content").classList.remove("hidden");
}

port.onMessage.addListener(on_recv_msg);
