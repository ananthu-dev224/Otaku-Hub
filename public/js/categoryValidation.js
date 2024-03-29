// Admin add and edit category validation here

// Regex pattern to check first letter as capital
function validateName(name){
    const nameValidate = /^[A-Za-z0-9]+$/;
    return nameValidate.test(name)
}



function categoryValidation(){
    let isValid = true;
    let category = document.getElementById('category').value;

    // Clear error content 
    document.getElementById('categoryError').textContent = ''


    if(category.trim() === ''){
        document.getElementById('categoryError').textContent = 'Field required'
        setTimeout(() => {
            document.getElementById('categoryError').textContent = ''
        }, 4000);
        isValid = false;
    }else if(!validateName(category)){
        document.getElementById('categoryError').textContent = 'Only alphabets and numbers are allowed'
        setTimeout(() => {
            document.getElementById('categoryError').textContent = ''
        }, 4000); 
        isValid = false
    }
    return isValid;
}