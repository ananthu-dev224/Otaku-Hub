// New Password Validation

// Regex for strong password
function validatePassword(password){
    const passwordValidate = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordValidate.test(password)
}

function newpasswordValidation(){
    let isValid = true;
    let password = document.getElementById('password').value;

    // clear the error area
    document.getElementById('passwordError').textContent = ''
    if(password.trim() === ''){
        document.getElementById('passwordError').textContent = 'Enter a new password'
        setTimeout(() => {
         document.getElementById('passwordError').textContent = ''
        }, 4000);
        isValid = false
     }
    if(!validatePassword(password)){
       document.getElementById('passwordError').textContent = 'Use a Strong Password'
       setTimeout(() => {
        document.getElementById('passwordError').textContent = ''
       }, 4000);
       isValid = false;
    }

    return isValid;
}