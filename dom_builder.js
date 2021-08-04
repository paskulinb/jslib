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
	if (typeof content == 'string') {
		el_.insertAdjacentHTML('beforeend', content);
	}
	else if (content instanceof Element || content instanceof Text) {
		el_.appendChild(content);
	}
	else if (Array.isArray(content) || content instanceof Object) {
		for (itm in content) {
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