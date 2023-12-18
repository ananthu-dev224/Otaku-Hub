const validateName = require('../../helpers/validateEmail')
const validateEmail = require('../../helpers/validateEmail')
const validateMobile = require('../../helpers/validateEmail')



function editProfileValidate(){
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const number = document.getElementById('number').value;
  
 
    document.getElementById('nameError').textContent = ''
    document.getElementById('emailError').textContent = ''
    document.getElementById('numberError').textContent = ''

 
    let isValid = true;
    // First name regex validation
    if(!validateName(name)){
       document.getElementById('nameError').textContent = 'First letter should be capital';
       document.getElementById('name').style.borderColor = 'red'
       setTimeout(()=>{
          document.getElementById('name').style.borderColor = ''
          document.getElementById('nameError').textContent = ''
       },5000)
       isValid = false;
    }
 
    // First name feild empty
    if(name.trim() === ''){
       document.getElementById('nameError').textContent = 'Feild is required';
       document.getElementById('name').style.borderColor = 'red'
       setTimeout(()=>{
          document.getElementById('name').style.borderColor = ''
          document.getElementById('nameError').textContent = ''
       },5000)
       isValid = false;
    }
 
 
    // Email regex validation 
    if(!validateEmail(email)){
       document.getElementById('emailError').textContent = 'Enter a valid email';
       document.getElementById('email').style.borderColor = 'red'
       setTimeout(()=>{
          document.getElementById('email').style.borderColor = ''
          document.getElementById('emailError').textContent = ''
       },5000)
       isValid = false;
    }
 
    // Email feild is empty
    if(email.trim() === ''){
       document.getElementById('emailError').textContent = 'Feild is required';
       document.getElementById('email').style.borderColor = 'red'
       setTimeout(()=>{
          document.getElementById('email').style.borderColor = ''
          document.getElementById('emailError').textContent = ''
       },5000)
       isValid = false;
    }
 
    // Mobile number regex 
    if(!validateMobile(number)){
       document.getElementById('numberError').textContent = 'Enter a valid mobile number';
       document.getElementById('number').style.borderColor = 'red'
       setTimeout(()=>{
          document.getElementById('number').style.borderColor = ''
          document.getElementById('numberError').textContent = ''
       },5000)
       isValid = false;
    }
    // Mobile number feild empty
    if(mobile.trim() === ''){
       document.getElementById('numberError').textContent = 'Feild is required';
       document.getElementById('number').style.borderColor = 'red'
       setTimeout(()=>{
          document.getElementById('number').style.borderColor = ''
          document.getElementById('numberError').textContent = ''
       },5000)
       isValid = false;
    }
    return isValid
 }
 

 
