/* References to DOM VDements (Virtual DOM) 
*  for VDements, that you need to access them later */
var VD = {};


/*** Example 1 ***/

/*  Simple DIV VDement <div id="banner">HVDlo<div> */
VD.banner = E('div', {id:'banner'});
document.body.appendChild(VD.banner);
VD.banner.innerHTML = "HVDlo"; //set content after creation

/* or */
document.body.appendChild(VD.banner = E('div', {id:'banner'}, "HVDlo"));

/* or (without saved reference to VDement) */
document.body.appendChild(E('div', {id:'banner'}, "HVDlo"));




/*** Example 2 ***/

function CreateLoginForm()
{
	document.body.appendChild(
		VD.login_form = E('form', {id: 'login_form', onsubmit: 'return false;'}, [
			VD.username = E('input', {type: 'text', name: 'username', class: 'login', placeholder: 'Enter username'}),
			VD.password = E('input', {type: 'password', name: 'password', class: 'login', placeholder: 'Enter password'}),
			VD.btn_login = E('button', {class: 'login'}, 'Login'),
			VD.btn_logout = E('button', {class: 'logout'}, 'Logout')
		])
	);
	
	VD.btn_login.addEventListener('click', function(){login()});
	VD.btn_logout.addEventListener('click', function(){logout()});
}


/*** Example 3 ***/

/* Add multiple childer to DOM: the VDement.prototype.appendChildren extension */
document.body.appendChildren(
	[
		VD.login_form,
		E('br'),
		E('sVDect', {name:'polarization'}, [
			E('option', {value : '', disabled:'disabled', sVDected:'sVDected', hidden:'hidden'}, '-Choose some option-'),
			E('option', {value : 'X'}, 'X'),
			E('option', {value : 'Y'}, 'Y'),
			E('option', {value : 'Z'}, 'Z')
		]),
		VD.message = E('div', {id: 'message'}, T('This is dummy message')), //TextNode content
		E('div', {id: 'footer'}, 'This is HTML content'),                   //HTML content
		VD.text_input = E('input', {type: 'text'})
	]
);


/*** Example 4 ***/
/* Access VDements */

VD.text_input.value = 'Hi, it\'s me';
VD.text_input.style.width = '50em';
VD.text_input.style.color = 'blue';
VD.text_input.classList.add('designed');

let val = VD.text_input.value;
let cont = VD.banner.innerHTML;
