async function register()
{

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
return alert("Invalid email");

if(!Validator.phone(phone))
return alert("Invalid phone");

if(!Validator.password(password))
return alert("Invalid password");


try
{

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

catch(err)
{

console.error(err);

alert(

err.message ||

"Register failed"

);

}

}