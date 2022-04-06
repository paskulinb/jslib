function Mutable(setup)
{
    this.name;

    this.container;
    this.input;

    this.value;
    this.label;
    this.initial_value;
    this.initial_label;

    this.onInputChange = function(name, value){ console.log({'name': name, 'value': value})};

    this.setup(setup);
}

Mutable.prototype.setup = function(setup)
{
    if (typeof setup != 'object') return;

    if (setup.name) this.name = setup.name;
    if (setup.container) this.setContainer(setup.container);
    if (setup.input) this.setInputElement(setup.input);
    if (setup.value) this.initValue(setup.value, setup.label ?? null);
    if (typeof setup.onInputChange == 'function') this.onInputChange = setup.onInputChange;
}

Mutable.prototype.setContainer = function(container)
{
    if (container instanceof HTMLElement) {
        this.container = container;
        this.initValue(this.container.dataset['value'] ?? this.container.innerText, this.container.innerText);
    }
}

Mutable.prototype.setInputElement = function(input_element)
{
    if (!(input_element instanceof HTMLElement)) return;

    this.input = input_element;
    this.input.setAttribute('name', this.name);
    this.input.owner = this;  //backreference
    
    this.input.addEventListener('change', (e)=>{

        e.target.owner.setValue(e.target.value,                                                           //any
                                e.target.opitons ? e.target.options[e.target.selectedIndex].text : null); //<SELECT>

        e.target.owner.onInputChange(e.target.owner.name, e.target.owner.value);
    });
}

Mutable.prototype.getValue = function()
{
    return this.value;
}

Mutable.prototype.initValue = function(value, label)
{
    this.setValue(value, label);
    this.initial_value = this.value;
    this.initial_label = this.label;
}

Mutable.prototype.setValue = function(value, label)
{
    this.value = value;
    this.label = label ?? value;
    
    if (this.container instanceof HTMLElement) {
        this.container.setAttribute('data-value', value);
    }

    if (this.input instanceof HTMLElement) {
        if (['INPUT','TEXTAREA'].includes(this.input.tagName)) {
            this.input.value = this.label;
        }
        else if ('SELECT' == this.input.tagName) {
            if (value) {
                this.input.value = this.value;
                this.label = this.input.options[this.input.selectedIndex].text;
            }
            else {// value nullish/falsy
                this.input.selectedIndex = -1;
           }
        }
    }
}

Mutable.prototype.setInputOptions = function(options)
{
    if (this.input.options) { //'SELECT' == this.input.tagName
        this.input.setChildren($d.OPTIONS(options));
    }
}




/************************************************ */
function MutableSet(setup)
{
    this.container = null;

    this.onEdit = function(){};
    this.onChange = function(data_name, data_value, mutable_obj){console.log('OnChange event handler = function(data_name, data_value, mutable_obj) =>', data_name, data_value, mutable_obj)}
    this.onCommit = function(data){console.log('OnCommit = function(data){}  data:', data)}
    this.onCancel = function(data){console.log('OnCancel = function(data){}  data:', data)}
    this.onStateChange = this._onStateChange;

    this.buttonEdit = null;
    this.buttonCommit = null;
    this.buttonCancel = null;
    this.buttonDelete = null;

    this.hooks = {};

    this.edit = this.edit.bind(this);
    this.commit = this.commit.bind(this);
    this.cancel = this.cancel.bind(this);

    this.setup(setup);
}

/**
 * setup = {
 *     container: DOM element contining DOM elements of class 'mutable' (optional; default = document.body)
 *     inputs : { data_name: dom.form_element, ... }  (optional; default = <input type"text">
 *     buttonEdit:
 *     buttonCommit:
 *     buttonCancel:
 *     onEdit:
 *     onChange:
 *     onCommit:
 *     onCancel:
 * }
 */
MutableSet.prototype.setup = function(setup)
{
    if (typeof setup != 'object') return;
    

    /** container  mutable elements */
    this.container = (setup.container instanceof HTMLElement) ? setup.container : document.body;

    /** hooks */
    this._setup_hooks(setup);

    /** custom event handlers */
    if (typeof setup.onEdit == 'function') this.onEdit = setup.onEdit;
    if (typeof setup.onChange == 'function') this.onChange = setup.onChange;
    if (typeof setup.onCommit == 'function') this.onCommit = setup.onCommit;
    if (typeof setup.onCancel == 'function') this.onCancel = setup.onCancel;
    if (typeof setup.onStateChange == 'function') this.onStateChange = setup.onStateChange;
   
  
    /* buttonEdit */
    if (setup.buttonEdit) {
        this.buttonEdit = setup.buttonEdit;  //user provided button
        this.buttonEdit.removeEventListener('click', this.edit);
        this.buttonEdit.addEventListener('click', this.edit);
    }
    /* buttonDelete */
    if (setup.buttonDelete) {
        this.buttonDelete = setup.buttonDelete;  //user provided button
    }
    /* buttonCommit */
    if (setup.buttonCommit) {
        this.buttonCommit = setup.buttonCommit;  //user provided button
        this.buttonCommit.removeEventListener('click', this.commit);
        this.buttonCommit.addEventListener('click', this.commit);
    }
    /* buttonCancel */
    if (setup.buttonCancel) {
        this.buttonCancel = setup.buttonCancel;  //user provided button
        this.buttonCancel.removeEventListener('click', this.cancel);
        this.buttonCancel.addEventListener('click', this.cancel);
    }

    this.onStateChange('idle');
}


MutableSet.prototype._setup_hooks = function(setup)
{
    this.hooks = {};

    /** Acquire data-mutable elements */
    this.container.querySelectorAll('[data-mutable]').forEach(
        (el) => {
            this.hooks[el.dataset['mutable']] = new Mutable({ 'name': el.dataset['mutable'],
                                                              'container': el });
        }
    );

    var THIS = this;
    /* inputs_controls */
    for (let key in this.hooks) { 
        var hook = this.hooks[key];

        //Attach user provided input
        if (setup['inputs'].hasOwnProperty(key)) {
            hook.setInputElement(setup['inputs'][key]);
        }
        else { // or a default one
            // var bb = hook.container.getBoundingClientRect();
            // hook.setInputElement( $d.INPUT({type:'text', style:'min-width:1em; min-height:1em; width:'+bb.width+'px; height:'+bb.height+'px;'}) );
            hook.setInputElement( $d.INPUT({type:'text'}) );
        }

        hook.onInputChange = function(name, value){
            THIS.onChange(name, value, THIS);
        }
    }
}

/** get hook */
MutableSet.prototype.$ = function(hook_name)
{
    return this.hooks[hook_name];
}


MutableSet.prototype.edit = function()
{
    this.onEdit(this);
    
    for (let key in this.hooks) {
        var hook = this.hooks[key];
        
        hook.container.removeChildren();
        hook.container.appendChild(hook.input);
        hook.input.value = hook['value'];
        hook['initial_value'] = hook['value'];
        hook['initial_label'] = hook['label'];
    }

    this.onStateChange('edit');
}

MutableSet.prototype.commit = function()
{
    console.log('MutSet::commit')

    for (let key in this.hooks) {
        var hook = this.hooks[key];

        if (['INPUT','TEXTAREA'].includes(hook.input.tagName)) {
            hook.container.innerText = hook['value'];
        }
        else if (hook.input.tagName == 'SELECT') {
            hook.container.setAttribute('data-value', hook['value']);
            hook.container.innerText = hook['label'];
        }
    }

    this.onStateChange('idle');
    this.onCommit(this.getData());
}

MutableSet.prototype.cancel = function()
{
    for (let key in this.hooks) {
        var hook = this.hooks[key];

        hook['value'] = hook['initial_value'];
        hook['label'] = hook['initial_label'];
        if (['INPUT','TEXTAREA'].includes(hook.input.tagName)) {
            hook.container.innerText = hook['initial_value'];
        }
        else if (hook.input.tagName == 'SELECT') {
            hook.container.setAttribute('data-value', hook['initial_value']);
            hook.container.innerText = hook['initial_label'];
        }
    }

    this.onStateChange('idle');
    this.onCancel(this.getData());
}

MutableSet.prototype.getData = function()
{
    var data = {};
    for (let key in this.hooks) {
        data[key] = this.hooks[key].getValue();
    }
    return data;
}

MutableSet.prototype._onStateChange = function(state)
{
    if (state == 'idle') {

        if (this.buttonEdit) {
            this.buttonEdit.classList.remove('disabled');
            this.buttonEdit.removeAttribute('disabled');
        }
        if (this.buttonDelete) {
            this.buttonDelete.classList.remove('disabled');
            this.buttonDelete.removeAttribute('disabled');
        }
        if (this.buttonCommit) {
            this.buttonCommit.classList.add('disabled');
            this.buttonCommit.setAttribute('disabled','disabled');
        }
        if (this.buttonCancel) {
            this.buttonCancel.classList.add('disabled');
            this.buttonCancel.setAttribute('disabled','disabled');
        }
    }
    else if (state == 'edit') {

        if (this.buttonEdit) {
            this.buttonEdit.classList.add('disabled');
            this.buttonEdit.setAttribute('disabled','disabled');
        }
        if (this.buttonDelete) {
            this.buttonDelete.classList.add('disabled');
            this.buttonDelete.setAttribute('disabled','disabled');
        }
        if (this.buttonCommit) {
            this.buttonCommit.classList.remove('disabled');
            this.buttonCommit.removeAttribute('disabled');
        }
        if (this.buttonCancel) {
            this.buttonCancel.classList.remove('disabled');
            this.buttonCancel.removeAttribute('disabled');
        }
    }
}