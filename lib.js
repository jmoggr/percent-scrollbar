const DEFAULT_OPTIONS = {
    minfontsize: 20,
    maxfontsize: 35,
    rightpadding: 0,
    transitiontime: 250,
    transitiondelay: 500,

    percentviewed: false,
    hidescrollbar: true,
    showpercentage: true,
    hideafterscroll: true,
    maximizeonscroll: true,
};

var OPTIONS_META = {
    hideafterscroll: {
		title: 'Hide After Scroll',
    },
    maximizeonscroll: {
        title: 'Maximize on Scroll',
    },
    hidescrollbar: {
        title: 'Hide Main Scrollbar',
    },
    showpercentage: {
        title: 'Show Percentage',
    },
    minimize: {
        title: 'Minimize',
    },
    transitiondelay: {
        title: 'Transition Delay (ms)',
    },
    percentviewed: {
        title: 'Use Percent Viewed',
    },
    transitiontime: {
        title: 'Transition Time (ms)',
    },
    minfontsize: {
        title: 'Font Size',
    },
    maxfontsize: {
        title: 'Maximized Font Size',
    },
    rightpadding: {
        title: 'Right Padding (px)',
    }
};

for (var option_key in OPTIONS_META) {
    OPTIONS_META[option_key].input_type = typeof DEFAULT_OPTIONS[option_key];
    OPTIONS_META[option_key].key = option_key;
}

function create_option_input_number(callback_port, option_meta, option_value) {
	let number_input = document.createElement('input');
	number_input.id = option_meta.key;
	number_input.type = 'number';
	number_input.value = option_value;
    number_input.addEventListener("change", () => {
    	callback_port.postMessage({
        	options: {
            	[option_meta.key]: number_input.value
            }
    	});
    });

    return number_input;
}

function create_option_input_boolean(callback_port, option_meta, option_value) {
	let switch_wrapper = document.createElement("label");
	switch_wrapper.classList.add('switch');

	let checkbox_input = document.createElement('input');
	checkbox_input.id = option_meta.key;
	checkbox_input.type = 'checkbox';
	checkbox_input.checked = option_value;
    checkbox_input.addEventListener("change", () => {
    	callback_port.postMessage({
        	options: {
            	[option_meta.key]: checkbox_input.checked
            }
    	});
    });

	let slider = document.createElement('span');
	slider.classList.add('slider');

	switch_wrapper.appendChild(checkbox_input);
	switch_wrapper.appendChild(slider);

	return switch_wrapper;
}

function set_option_inputs(options) {
	for (var option_key in options) {
    	if (!(option_key in OPTIONS_META)) {
        	continue;
    	}

        var option_input = document.getElementById(option_key);
    	switch (OPTIONS_META[option_key].input_type) {
    		case 'boolean':
    			option_input.checked = options[option_key];
    		break;
    		case 'number':
    			option_input.value = options[option_key];
    		break;
    		default:
    			console.log('error');
    	}
	}
}

function create_option_input(container_div, callback_port, option_meta, option_value) {
	let option_title = document.createElement("span");
	option_title.classList.add('option-title');
	option_title.innerText = option_meta.title;

	var option_input;
	switch (option_meta.input_type) {
		case 'boolean':
			option_input = create_option_input_boolean(callback_port, option_meta, option_value);
		break;
		case 'number':
			option_input = create_option_input_number(callback_port, option_meta, option_value);
		break;
		default:
			console.log('error');
			return;
	}

	container_div.appendChild(option_title);
	container_div.appendChild(option_input);
}

function is_iframe() {
    return (window != parent);
}

function on_dom_ready(callback) {
    if(document.readyState === 'complete') {
        callback();
    } else {
        window.addEventListener('DOMContentLoaded', callback, false);
    }
}

