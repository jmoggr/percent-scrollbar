const HIDESCROLLBAR_RULE = `html,body { scrollbar-width: none !important; }`;

function load_options() {
	return browser.storage.sync.get(DEFAULT_OPTIONS);
}

load_options().then(global_options => {
    var popup_ports = {};

	var content_script;
    var global_options;

    var tab_ports = {};
    var tab_options = {};

    function get_tab_options(tab_id) {
        if (!(tab_id in tab_options)) {
            return global_options;
        } else {
    		return backfill_globals(Object.assign({}, tab_options[tab_id]));
        }
    }

    function on_tab_updated(tab_id, change_info) {
		// if status is loading and url is not set, TODO
        if (('status' in change_info) && ('url' in change_info) && (change_info['status'] == 'loading')) {
            let options = get_tab_options(tab_id);

            set_scrollbar_visibility(tab_id, options);
        }
    }

    function set_scrollbar_visibility(tab_id, options) {
		if (options.hidescrollbar) {
    		console.log('hiding scrollbar');
            browser.tabs.insertCSS(tab_id, {code: HIDESCROLLBAR_RULE, runAt: "document_start" });
		} else {
    		console.log('showing scrollbar');
            browser.tabs.removeCSS(tab_id, {code: HIDESCROLLBAR_RULE});
		}
    }

    function backfill_globals(options) {
        for(const option_key in global_options)
        {
            if(!options.hasOwnProperty(option_key))
            {
                options[option_key] = global_options[option_key];
            }
        }

        return options;
    }

    async function get_current_tab() {
    	let focussed_tabs = await browser.tabs.query({active: true, currentWindow: true});
    	return focussed_tabs[0];
    }

    async function get_current_tab_id() {
        let current_tab = await get_current_tab();
        return current_tab.id;
    }


    function on_tab_connected(port) {
        let tab_id = port.sender.tab.id;
        console.log('tab connected: ', tab_id);

        let options = get_tab_options(tab_id);

        port.postMessage({options: options});
        tab_ports[tab_id] = port;
    }

    async function on_popup_connected(port) {
    	let tab_id = await get_current_tab_id();

        console.log('popup connected: ', tab_id);

    	if (!(tab_id in tab_ports)) {
            port.postMessage({ error: 'Current tab is not connected to plugin. Try Refreshing current tab.' });
			return;
    	}

        let options = get_tab_options(tab_id);

        port.postMessage({options: options});
        port.onMessage.addListener(msg => on_popup_msg(tab_id, msg.options));
        popup_ports[tab_id] = port;
    }

    function on_popup_msg(tab_id, options) {
        if (!(tab_id in tab_options)) {
            tab_options[tab_id] = {}
        }

        for (const option_key in options) {
    		if (option_key in DEFAULT_OPTIONS) {
        		tab_options[tab_id][option_key] = options[option_key];
        		console.log("set tab option: ", option_key, " for tab: ", tab_id);
    		} else {
        		console.log("error, trying to set unkown option: ", option_key, " for tab: ", tab_id);
    		}
        }

        let all_options = get_tab_options(tab_id);
		set_scrollbar_visibility(tab_id, all_options);
        tab_ports[tab_id].postMessage({options: all_options});
    }

    function on_preferences_connected(port) {
        console.log('preferences connected');

        port.postMessage({options: global_options});
        port.onMessage.addListener(on_preferences_msg);
    }

    async function on_preferences_msg(msg) {
    	console.log('got preferences msg: ', msg);

    	for (var option_key in global_options) {
        	if (option_key in msg.options) {
            	global_options[option_key] = msg.options[option_key];
        	}
    	}

    	browser.storage.sync.set(global_options);

    	let all_tabs = await browser.tabs.query({});
    	for (var tab of all_tabs) {
        	if (('id' in tab) && (tab.id in tab_ports)) {
                let all_options = get_tab_options(tab.id);
                set_scrollbar_visibility(tab.id, all_options);
                tab_ports[tab.id].postMessage({options: all_options});
        	}
    	}
    }

    async function on_connected(port) {
        if (port.name == 'CONTENT_SCRIPT') {
            on_tab_connected(port);
        } else if (port.name == 'ACTION_POPUP') {
    		on_popup_connected(port);
        } else if (port.name == 'ADDON_PREFERENCES') {
    		on_preferences_connected(port);
        } else {
    		console.log('error');
        }
    }

    browser.tabs.onUpdated.addListener(on_tab_updated);
    browser.runtime.onConnect.addListener(on_connected);
});

