var $d = new function()
{
	this.auto_increment_index = 0;
	this.autoIncIdx = function() { return this.auto_increment_index++; }


	/* Create New DOM Element */
	this.E = function(tag_name, attr, content)
	{
		let el_ = document.createElement(tag_name);
		
		/* attr: */
		if (attr != undefined && attr != null) {
			for (key in attr) {
				el_.setAttribute(key, attr[key]);
			}
		}
		
		/* content: */
		if (typeof content != 'undefined') el_.content(content);

		/* event listener */
		el_.on = function(event_type, event_handler)
		{
			this.addEventListener(event_type, event_handler);
			return this;
		}

		return el_;
	}

	/* Create DOM Text Node */
	this.T = function(text)
	{
		return document.createTextNode(text);
	}


	/** Shorthands for Elements ************************************/
	this.DIV = function(attr, content) { return this.E('div', attr, content); }
	this.SPAN = function(attr, content) { return this.E('span', attr, content); }
	this.P = function(attr, content) { return this.E('p', attr, content); }
	this.FORM = function(attr, content) { return this.E('form', attr, content); }
	this.INPUT = function(attr, content) { return this.E('input', attr, content); }
	this.TEXTAREA = function(attr, content) { return this.E('textarea', attr, content); }
	this.BUTTON = function(attr, content) { return this.E('button', attr, content); }
	this.LABEL = function(attr, content) { return this.E('label', attr, content); }
	this.FIELDSET = function(attr, content) { return this.E('fieldset', attr, content); }
	this.LEGEND = function(attr, content) { return this.E('legend', attr, content); }
	this.DATALIST = function(attr, content) { return this.E('datalist', attr, content); }
	this.A = function(attr, content) { return this.E('a', attr, content); }
	this.UL = function(attr, content) { return this.E('ul', attr, content); }
	this.OL = function(attr, content) { return this.E('ol', attr, content); }
	this.LI = function(attr, content) { return this.E('li', attr, content); }
	this.IMG = function(attr) { return this.E('img', attr); }
	this.BR = function() { return this.E('br'); }
	this.HR = function() { return this.E('hr'); }
	this.OPTION = function(attr, content) { return this.E('option', attr, content); }
	this.OPTIONS = function(content) { 
		var options = [];
		for (let opt of content) {

			if (opt instanceof Element && opt.tagName == 'OPTION') {
				options.push(opt);
				continue;
			}

			if (typeof opt == 'string' || typeof opt == 'number') {
				options.push(this.OPTION({value:opt}, opt));
				continue;
			}

			if (typeof opt == 'object') {
				let label = opt['label'] ?? opt['value'] ?? '';
				let opt_ = { ...opt }; //clone (shallow copy)
				delete opt_['label']; //not a valid attribute
				options.push(this.OPTION(opt_, label));
				continue;
			}
		}
		return options;
	}

	this.SELECT = function(attr, content)
	{ 
		return this.E('select', attr, this.OPTIONS(content)); 
	}

	this.TCell = function(tagname, attr, content)
	{
		return this.E(tagname, attr, content);
	}

	this.TD = function(attr, content)
	{
		return this.TCell('td', attr, content);
	}

	this.TH = function(attr, content)
	{
		return this.TCell('th', attr, content);
	}

	this.TR = function(attr, content)
	{
		if (Array.isArray(content)) {
			let cells = [];
			for (let c of content) {
				if (c instanceof Element && (c.tagName == 'TH' || c.tagName == 'TD')) cells.push(c);
				else cells.push(this.TD({}, c));
			}
			return this.E('tr', attr, cells);
		}
		return this.E('tr', attr);
	}

	/**
	 * @param {!Object} form_attributes - HTML FORM element attributes
	 * @param {{ inputs: array , url: string , after_upload: Function }} properties - prop
	 * @param {array} properties.inputs
	 * [{input_name: ... , accept: ... }, ... ]
	 * @param {string} properties.url
	 * destination to send FormData
	 * @param {function} properties.after_upload
	 * callback function
	 * @returns HTMLFormElement
	 */
	//this.FileInputForm = function(inputs, url, after_upload)
	this.FileInputForm = function(form_attributes, properties)
	{
		var multiple = properties.inputs.length > 1;

		form_attributes['enctype'] = 'multipart/form-data';
		var form = this.FORM (form_attributes);

		var send = function() {
			ajax.post(properties.url, new FormData(form), (response) => {
				if (typeof properties.after_upload == 'function') after_upload(response);
			});
		}

		for (let input of properties.inputs) {

			var idx = this.autoIncIdx();
			
			var input_file = this.INPUT ({type:'file', name:input['input_name'], accept:input['accept'], id:'finput'+idx, 'data-index':idx, hidden:'hidden'});
			if (input.hasOwnProperty('multiple')) {
				input_file.setAttribute('multiple', 'multiple');
				input_file.setAttribute('data-range', input['multiple']);
			}
			

			if (multiple) {

				let list;
				form.appendChild(
					this.DIV({}, [
						this.LABEL ({for:'finput'+idx, id:'lbl'+idx, class:'bi-list button'}),
						list = this.INPUT ({type:'text', id:'txt'+idx, 'data-index': idx, readonly:'readonly'}),  //display filename
						input_file,
					]));

				input_file.addEventListener('change', (e) => {
					var FI = e.target;  // Dom Input Element
					let range = FI.dataset['range'].split(/\D+/);

					if (range.length == 1) { //Exact number of files expected
						if (FI.files.length != range[0]) alert('Expected exactly '+range[0]+' files. '+FI.files.length+' have been selected.');
					}
					else if (range.length == 2) { //Range of files count defined
						if (FI.files.length < range[0]) alert('Expected minimum '+range[0]+' files. '+FI.files.length+' have been selected.');
						else if (FI.files.length > range[1]) alert('Expected maximum '+range[1]+' files. '+FI.files.length+' have been selected.');
					}

					var files = [];
					for (let i = 0; i < FI.files.length; ++i) files.push(FI.files[i]['name']);
					document.querySelector('#txt'+FI.dataset['index']).value = files;
				});

				list.addEventListener('click', (e)=>{ document.querySelector('#lbl'+e.target.dataset['index']).click(); }); //forward click event
			}
			
			if (!multiple) {

				form.appendChild(this.LABEL ({for:'finput'+idx, class:'bi-upload button'}));
				form.appendChild(input_file);
				input_file.addEventListener('change', () => { //submit instantly on change
					send();
					form.reset(); //to enable the 'change' event for next time
				});
			}
		}

		/** submit button */
		if (multiple) {

			let submit = this.SPAN ({class:'bi-upload button'});
			submit.addEventListener('click', (e) => {
				send();
			});
			
			form.appendChild(submit);
		}

		return form;
	}

	this.FileInput = function(arg)
	{
		var uuid = this.autoIncIdx();

		var input = this.INPUT ({type:'file', name:arg['name'], accept:arg['accept'], id:'finput'+uuid, 'data-uuid':uuid, hidden:'hidden'});
		if (arg.hasOwnProperty('multiple')) {
			input.setAttribute('multiple', 'multiple');
			input.setAttribute('data-range', arg['multiple']);
		}
	
		var list = this.INPUT ({type:'text', /*id:'list'+uuid,*/ 'data-uuid': uuid, readonly:'readonly'});  //display filenames
		list.addEventListener('click', (e)=>{ label.click(); }); //forward click event
		if (arg.hasOwnProperty('placeholder')) {
			list.setAttribute('placeholder', arg['placeholder']);
		}

		var label = this.LABEL ({for:'finput'+uuid, /*id:'lbl'+uuid,*/ class:'bi-list button'});


		input.addEventListener('change', (e) => {

			var FI = e.target;  // Dom Input Element

			/* display selected filenames */
			var files = [];
			for (let k = 0; k < FI.files.length; ++k) files.push(FI.files[k]['name']);
			list.value = files;

			/* validate selection */
			if (FI.dataset['range'] && FI.files.length > 0) {
				let range = FI.dataset['range'].split(/\D+/);
				if (range.length == 1) { //Exact number of files expected
					if (FI.files.length != range[0]) alert('Expected exactly '+range[0]+' files. '+FI.files.length+' have been selected.');
				}
				else if (range.length == 2) { //Range of files count defined
					if (FI.files.length < range[0]) alert('Expected minimum '+range[0]+' files. '+FI.files.length+' have been selected.');
					else if (FI.files.length > range[1]) alert('Expected maximum '+range[1]+' files. '+FI.files.length+' have been selected.');
				}
			}

		});

		
		return this.DIV({},
			[
				input,
				label,
				list, 
			]);
	}

	this.LoaderSpinner = function(arg)
	{
		var loader = $d.DIV({class:'loader-spinner'});
		if (arg && arg['size']) {
			loader.style.width = arg['size'];
			loader.style.height = arg['size'];
		}

		loader.show = function() { this.classList.add('loading'); }
		loader.hide = function() { this.classList.remove('loading'); }
		return loader;
	}
}

Object.getPrototypeOf($d).TABLE = function(attr, content)
{
	this.E = {
		table: $d.E('table', attr),
		thead: null, //E('thead');
		tbody: null, //E('tbody');
		caption: null //E('caption');
	}
	//this.cells = [];

	if (content instanceof Object) this.setContent(content);
}

Object.getPrototypeOf($d).TABLE.prototype.getRef = function()
{
	return this.E.table;
}

Object.getPrototypeOf($d).TABLE.prototype.setContent = function(content)
{
	this.content = content;

	/** THEAD */
	if (this.E.thead instanceof Element) {
		this.E.table.removeChild(this.E.thead);
	}
	if (this.content.hasOwnProperty('theadValues')) {
		this.E.thead = this.E.table.appendChild($d.E('thead'));
		if (Array.isArray(this.content.theadValues)) {
			let tr = this.E.thead.appendChild($d.E('tr'));
			for (let val of this.content.theadValues) {
				tr.appendChild($d.E('th', {}, val));
			}
		}
		this.E.table.appendChild(this.E.thead);
	}

	/** TBODY */
	if (this.E.tbody instanceof Element) {
		this.E.table.removeChild(this.E.tbody);
	}
	if (this.content.hasOwnProperty('cellValues')) {
		this.E.tbody = this.E.table.appendChild($d.E('tbody'));
		if (Array.isArray(this.content.cellValues)) {
			for (let row of this.content.cellValues) {
				let tr = this.E.tbody.appendChild($d.E('tr'));
				for (let val of row) {
					tr.appendChild($d.E('td', {}, val));
				}
			}
		}
		this.E.table.appendChild(this.E.tbody);
	}

	/** CELLS */
	if (this.content.hasOwnProperty('cells')) {
		this.E.tbody = this.E.table.appendChild($d.E('tbody'));
		for (let row of this.content.cells) {
			if (row instanceof Element) {
				if (row.tagName == 'TR') this.E.tbody.appendChild(row);
				continue; 
			}
			if (Array.isArray(row)) {
				this.E.tbody.appendChild($d.TR({}, row));
			}
		}
		this.E.table.appendChild(this.E.tbody);
	}
}


/* Extend the Element object */
Element.prototype.appendChildren = function (children)
{
	if (Array.isArray(children) || children instanceof Object) {
		for (ch in children) {
			if (children[ch] instanceof Element || children[ch] instanceof Text) {
				this.appendChild(children[ch]);
			}
		}
	}
};

Element.prototype.removeChildren = function()
{
	while (this.lastChild) this.lastChild.remove();
};

Element.prototype.setChildren = function(children)
{
	this.removeChildren();
	this.appendChildren(children);
}

Element.prototype.content = function(content)
{
	this.removeChildren();

	if (typeof content == 'function') {
		content = content.bind(this).call();
	}
	if (typeof content == 'string' || typeof content == 'number') {
		this.insertAdjacentHTML('beforeend', content);
	}
	else if (content instanceof Element || content instanceof Text) {
		this.appendChild(content);
	}
	else if (Array.isArray(content) || content instanceof Object) {
		for (itm in content) {
			if (typeof content[itm] == 'string' || typeof content[itm] == 'number') {
				this.insertAdjacentHTML('beforeend', content[itm]);
			} else
			if (content[itm] instanceof Element || content[itm] instanceof Text) {
				this.appendChild(content[itm]);
			}
		}
	}
	
	return this;
}
Element.prototype.data = function(name, value)
{
	/** remove attribute */
	if (value === null) {
		this.removeAttribute('data-'+name);
		return this;
	}
	/** getter */
	if (typeof value == 'undefined') {
		return (name in this.dataset) ? this.dataset[name] : null;
	}
	/** setter */
	this.setAttribute('data-'+name, value);
	return this;
}
