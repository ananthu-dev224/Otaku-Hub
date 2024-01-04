// User login validation 

function loginValidation(){
   let isValid = true;
   let email = document.getElementById('email').value;
   let password = document.getElementById('password').value;

    // Clear the error areas
    document.getElementById('emailError').textContent = ''
    document.getElementById("passwordError").textContent = ''

    if(email.trim() === ''){
        document.getElementById('emailError').textContent = 'Enter your email'
        setTimeout(() => {
            document.getElementById('emailError').textContent = ''    
        }, 4000);
        isValid = false;
    }

    if(password.trim() === ''){
        document.getElementById('passwordError').textContent = 'Enter your password'
        setTimeout(() => {
            document.getElementById('passwordError').textContent = ''    
        }, 4000);
        isValid = false
    }

    return isValid;
}