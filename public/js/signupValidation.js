// User Signup Validation here

// Regex checking username
function validateName(name){
    const nameValidate = /^[A-Z][a-z]*$/;
    return nameValidate.test(name)
}

// Regex checking mobile number
function validateNumber(number){
    const numberValidate = /^[0-9]{10}$/;
    return numberValidate.test(number)
}

// Regex checking of email
function validateEmail(email){
    const emailValidate = /^[^\s@]+@gmail.com$/;
    return emailValidate.test(email)
}

// Regex checking of strong password
function validatePassword(password){
    const passwordValidate = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordValidate.test(password)
}

// Main function of validation
function signupValidation(){
    let isValid = true;

    // Taking all values
    let name = document.getElementById('name').value;
    let number = document.getElementById('phonenumber').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    


    // Resetting values in error field
    document.getElementById('nameError').textContent = ''
    document.getElementById('phonenumberError').textContent = ''
    document.getElementById('emailError').textContent = ''
    document.getElementById('passwordError').textContent = ''

    // Checking name
    if(name.trim() === ''){
        document.getElementById('nameError').textContent = 'Username is mandatory'
        setTimeout(() => {
          document.getElementById('nameError').textContent =''
        }, 5000);
        isValid = false; 
    }
    if(!validateName(name)){
        document.getElementById('nameError').textContent = 'First letter should be capital'
        setTimeout(() => {
          document.getElementById('nameError').textContent =''
        }, 5000);
        isValid = false;  
    }

    // Checking email
    if(email.trim() === ''){
        document.getElementById('emailError').textContent = 'Email is mandatory'
        setTimeout(() => {
          document.getElementById('emailError').textContent =''
        }, 5000);
        isValid = false; 
    }
    if(!validateEmail(email)){
       document.getElementById('emailError').textContent = 'Enter a valid email address'
       setTimeout(() => {
         document.getElementById('emailError').textContent =''
       }, 5000);
       isValid = false;
    }
     
    // Checking Phone number
    if(number.trim() === ''){
        document.getElementById('phonenumberError').textContent = 'Phone number is mandatory'
        setTimeout(() => {
          document.getElementById('phonenumberError').textContent =''
        }, 5000);
        isValid = false; 
    }
    if(!validateNumber(number)){
        document.getElementById('phonenumberError').textContent = 'Enter a valid Phone number'
        setTimeout(() => {
          document.getElementById('phonenumberError').textContent =''
        }, 5000);
        isValid = false; 
    }

    // Checking Strong Password
    if(password.trim() === ''){
        document.getElementById('passwordError').textContent = 'Password is mandatory'
        setTimeout(() => {
          document.getElementById('passwordError').textContent =''
        }, 5000);
        isValid = false; 
    }
    if(!validatePassword(password)){
        document.getElementById('passwordError').textContent = 'Please provide a strong password'
        setTimeout(() => {
          document.getElementById('passwordError').textContent =''
        }, 5000);
        isValid = false; 
    }
   return isValid;
}