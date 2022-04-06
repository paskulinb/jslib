/* Create New DOM Element */
function E(tag_name, attr, content)
{
	let el_ = document.createElement(tag_name);
	
	/* attr: */
	if (attr != undefined && attr != null) {
		for (key in attr) {
			el_.setAttribute(key, attr[key]);
		}
	}
	
	/* content: */
	if (typeof content == 'undefined') return el_;

	if (typeof content == 'string' || typeof content == 'number') {
		el_.insertAdjacentHTML('beforeend', content);
	}
	else if (content instanceof Element || content instanceof Text) {
		el_.appendChild(content);
	}
	else if (Array.isArray(content) || content instanceof Object) {
		for (itm in content) {
			if (typeof content[itm] == 'string' || typeof content[itm] == 'number') {
				el_.insertAdjacentHTML('beforeend', content[itm]);
			} else
			if (content[itm] instanceof Element || content[itm] instanceof Text) {
				el_.appendChild(content[itm]);
			}
		}
	}

	return el_;
}

/* Create DOM Text Node */
function T(text)
{
	return document.createTextNode(text);
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

/** Shorthands for Elements ************************************/
function DIV(attr, content) { return E('div', attr, content); }
function SPAN(attr, content) { return E('span', attr, content); }
function FORM(attr, content) { return E('form', attr, content); }
function INPUT(attr, content) { return E('input', attr, content); }
function TEXTAREA(attr, content) { return E('textarea', attr, content); }
function LABEL(attr, content) { return E('label', attr, content); }
function A(attr, content) { return E('a', attr, content); }
function UL(attr, content) { return E('ul', attr, content); }
function OL(attr, content) { return E('ol', attr, content); }
function LI(attr, content) { return E('li', attr, content); }
function IMG(attr) { return E('img', attr); }
function BR() { return E('br'); }
function OPTION(attr, content) { return E('option', attr, content); }
function OPTIONS(content) { 
	var options = [];
	for (let opt of content) {

		if (opt instanceof Element && opt.tagName == 'OPTION') {
			options.push(opt);
			continue;
		}

		if (typeof opt == 'string') {
			options.push(OPTION({value:opt}, opt));
			continue;
		}

		if (typeof opt == 'object') {
			let label = opt['label'] ?? opt['value'] ?? '';
			let opt_ = { ...opt }; //clone (shallow copy)
			delete opt_['label']; //not a valid attribute
			options.push(OPTION(opt_, label));
			continue;
		}
	}
	return options;
}
function SELECT(attr, content)
{ 
	return E('select', attr, OPTIONS(content)); 
}

function TCell(tagname, attr, content)
{
	return E(tagname, attr, content);
}

function TD(attr, content)
{
	return TCell('td', attr, content);
}
function TH(attr, content)
{
	return TCell('th', attr, content);
}

function TR(attr, content)
{
	if (Array.isArray(content)) {
		let cells = [];
		for (let c of content) {
			if (c instanceof Element && (c.tagName == 'TH' || c.tagName == 'TD')) cells.push(c);
			else cells.push(TD({}, c));
		}
		return E('tr', attr, cells);
	}
	return E('tr', attr);
}

function TABLE(attr, content)
{
	this.E = {
		table: E('table', attr),
		thead: null, //E('thead');
		tbody: null, //E('tbody');
		caption: null //E('caption');
	}
	//this.cells = [];

	if (content instanceof Object) this.setContent(content);
}

TABLE.prototype.getRef = function()
{
	return this.E.table;
};

TABLE.prototype.setContent = function(content)
{
	this.content = content;

	/** THEAD */
	if (this.E.thead instanceof Element) {
		this.E.table.removeChild(this.E.thead);
	}
	if (this.content.hasOwnProperty('theadValues')) {
		this.E.thead = this.E.table.appendChild(E('thead'));
		if (Array.isArray(this.content.theadValues)) {
			let tr = this.E.thead.appendChild(E('tr'));
			for (let val of this.content.theadValues) {
				tr.appendChild(E('th', {}, val));
			}
		}
		this.E.table.appendChild(this.E.thead);
	}

	/** TBODY */
	if (this.E.tbody instanceof Element) {
		this.E.table.removeChild(this.E.tbody);
	}
	if (this.content.hasOwnProperty('cellValues')) {
		this.E.tbody = this.E.table.appendChild(E('tbody'));
		if (Array.isArray(this.content.cellValues)) {
			for (let row of this.content.cellValues) {
				let tr = this.E.tbody.appendChild(E('tr'));
				for (let val of row) {
					tr.appendChild(E('td', {}, val));
				}
			}
		}
		this.E.table.appendChild(this.E.tbody);
	}

	/** CELLS */
	if (this.content.hasOwnProperty('cells')) {
		this.E.tbody = this.E.table.appendChild(E('tbody'));
		for (let row of this.content.cells) {
			if (row instanceof Element) {
				if (row.tagName == 'tr') this.E.tbody.appendChild(row);
				continue; 
			}
			if (Array.isArray(row)) {
				this.E.tbody.appendChild(TR({}, row));
			}
		}
		this.E.table.appendChild(this.E.tbody);
	}
};