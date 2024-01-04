// User Address 

// Regex pattern to check pincode
function validatePIN(pincode){
    const pinPattern = /^\d+$/;
    return pinPattern.test(pincode)
}


function addressValidation(){
   let isValid = true;
   let address = document.getElementById('address').value;
   let street = document.getElementById('street').value;
   let city = document.getElementById('city').value;
   let pincode = document.getElementById('pcode').value;
   let state = document.getElementById('state').value;
console.log(pincode)
    // Clear all the error areas
    document.getElementById('houseaddressError').textContent = ''
    document.getElementById('streetError').textContent = ''
    document.getElementById('cityError').textContent = ''
    document.getElementById('pincodeError').textContent = ''
    document.getElementById('stateError').textContent = ''
    
    if(address.trim() === ''){
        document.getElementById('houseaddressError').textContent = 'Field required'
        setTimeout(() => {
            document.getElementById('houseaddressError').textContent = ''
        }, 4000); 
        isValid = false;
    }
    if(street.trim() === ''){
        document.getElementById('streetError').textContent = 'Field required'
        setTimeout(() => {
            document.getElementById('streetError').textContent = ''
        }, 4000); 
        isValid = false;
    }
    if(city.trim() === ''){
        document.getElementById('cityError').textContent = 'Field required'
        setTimeout(() => {
            document.getElementById('cityError').textContent = ''
        }, 4000); 
        isValid = false;
    }
    if(pincode.trim() === ''){
        document.getElementById('pincodeError').textContent = 'Field required'
        setTimeout(() => {
            document.getElementById('pincodeError').textContent = ''
        }, 4000); 
        isValid = false;
    }else if(!validatePIN(pincode)){
        document.getElementById('pincodeError').textContent = 'Postal Code should be in numbers'
        setTimeout(() => {
            document.getElementById('pincodeError').textContent = ''
        }, 4000); 
        isValid = false;
    }

    if(state.trim() === ''){
        document.getElementById('stateError').textContent = 'Field required'
        setTimeout(() => {
            document.getElementById('stateError').textContent = ''
        }, 4000); 
        isValid = false;
    }
    return isValid;
}