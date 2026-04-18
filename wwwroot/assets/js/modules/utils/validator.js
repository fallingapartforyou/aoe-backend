const Validator = {

email(email) {

return /^[a-zA-Z0-9._%+-]{1,20}@gmail\.com$/
.test(email);

},

phone(phone) {

return /^[0-9]{1,11}$/
.test(phone);

},

name(name) {

return /^[^\s]{1,25}$/
.test(name);

},

password(password) {

return /^[^\s]{1,20}$/
.test(password);

},

classCode(code) {

return /^[a-zA-Z0-9]{1,8}$/
.test(code);

},

assignmentName(name) {

return /^[a-zA-Z0-9 ]{1,20}$/
.test(name);

},

fillBlankAnswer(text) {

return /^[a-zA-Z]+$/
.test(text);

}

};