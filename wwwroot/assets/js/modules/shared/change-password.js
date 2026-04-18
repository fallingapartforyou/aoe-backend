async function changePassword()
{

const btn =
document.getElementById(
"changeBtn"
);


const oldPassword =
document.getElementById(
"oldPassword"
).value.trim();


const newPassword =
document.getElementById(
"newPassword"
).value.trim();



if (!oldPassword || !newPassword)
{

alert("Please fill all fields");

return;

}


if (newPassword.length < 6)
{

alert("New password must be at least 6 characters");

return;

}


btn.disabled = true;
btn.innerText =
"Changing...";


try
{

await API.request(

"/user/change-password",

"PUT",

{
oldPassword,
newPassword
}

);


btn.innerText =
"Changed successfully";

btn.classList
.remove("btn-primary");

btn.classList
.add("btn-success");


setTimeout(() =>
{

history.back();

}, 1200);


}
catch(err)
{

console.error(err);

btn.disabled = false;

btn.innerText =
"Change Password";

alert("Change password failed");

}

}