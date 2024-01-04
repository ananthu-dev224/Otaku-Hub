// Edit profile validation here

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

function profileValidation(){
    let isValid = true;
    let name = document.getElementById('name').value;
    let number = document.getElementById('number').value;

    // clear th error area
    document.getElementById('nameError').textContent = ''
    document.getElementById('numberError').textContent = ''

    if(name.trim() === ''){
        document.getElementById('nameError').textContent = 'Username cannot be blank'
        setTimeout(() => {
            document.getElementById('nameError').textContent = ''    
        }, 4000);
        isValid = false;
    }
    if(!validateName(name)){
        document.getElementById('nameError').textContent = 'First letter should be capital'
        setTimeout(() => {
            document.getElementById('nameError').textContent = ''    
        }, 4000);
        isValid = false;
    }

    if(number.trim() === ''){
        document.getElementById('numberError').textContent = 'Phone number cannot be blank'
        setTimeout(() => {
            document.getElementById('numberError').textContent = ''    
        }, 4000);
        isValid = false;
    }
    if(!validateNumber(number)){
        document.getElementById('numberError').textContent = 'Enter a valid phone number'
        setTimeout(() => {
            document.getElementById('numberError').textContent = ''    
        }, 4000);
        isValid = false;
    }

    return isValid;
}