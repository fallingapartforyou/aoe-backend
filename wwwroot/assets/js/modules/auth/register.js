async function register() {

const name =
document.getElementById("name").value.trim();

const email =
document.getElementById("email").value.trim();

const phone =
document.getElementById("phone").value.trim();

const password =
document.getElementById("password").value.trim();

const role =
document.getElementById("role").value;


if(!Validator.name(name))
return alert("Invalid name");

if(!Validator.email(email))
return alert("Invalid gmail");

if(!Validator.phone(phone))
return alert("Invalid phone");

if(!Validator.password(password))
return alert("Invalid password");


await API.request(

"/auth/register",

"POST",

{

name,
email,
phone,
password,
role

}

);

alert("Register success");

Router.goLogin();

}