async function joinClass() {

try {

const classCode =
document
.getElementById("classCode")
.value
.trim();

if(!classCode)
return alert("Enter class code");


if(!Validator.classCode(classCode))
return alert(
"Class code max 8 characters (letters + numbers only)"
);


await API.request(

"/class/join",

"POST",

{ classCode }

);

alert("Joined successfully");

location.href =
"/pages/student/classes.html";

}

catch(err) {

console.error(err);

alert("Join failed");

}

}