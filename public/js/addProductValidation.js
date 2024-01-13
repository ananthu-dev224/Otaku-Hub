// Product add validation

// Regex checking username
function validateName(name){
    const nameValidate = /^[A-Za-z0-9 ]+$/    ;
    return nameValidate.test(name)
}

// Regex pattern to check if it the value is number
function validateStock(stock){
    const stockPattern = /^\d+$/;
    return stockPattern.test(stock)
}

function addProductValidation(){
    let isValid = true;
    let name = document.getElementById('name').value;
    let category = document.getElementById('category').value;
    let description = document.getElementById('description').value;
    let price = document.getElementById('price').value;
    let discount = document.getElementById('discount').value;


    // Clear the error areas 
    document.getElementById('nameError').textContent = ''
    document.getElementById('categoryError').textContent = ''
    document.getElementById('descriptionError').textContent = ''
    document.getElementById('priceError').textContent = ''
    document.getElementById('discountError').textContent = ''

    // validating name 
    if(name.trim() === ''){
        document.getElementById('nameError').textContent = "Field required"
        setTimeout(() => {
            document.getElementById('nameError').textContent = ""
        }, 4000);
        isValid = false
    }else if(!validateName(name)){
        document.getElementById('nameError').textContent = "Only Alphabets and numbers are allowed"
        setTimeout(() => {
            document.getElementById('nameError').textContent = ""
        }, 4000);
        isValid = false
    }

    // validating category
    if(category.trim() === ''){
        document.getElementById('categoryError').textContent = "Field required"
        setTimeout(() => {
            document.getElementById('categoryError').textContent = ""
        }, 4000);
        isValid = false 
    }

    // validating description
    if(description.trim() === ''){
        document.getElementById('descriptionError').textContent = "Field required"
        setTimeout(() => {
            document.getElementById('descriptionError').textContent = ""
        }, 4000); 
        isValid = false
    }
    // Validating stock
   // Validating stock or outfit sizes based on category
   if (category === 'Outfits') {
    ['s', 'm', 'l', 'xl'].forEach(size => {
        let sizeValue = document.getElementById(size).value;
        console.log(`${size} value:`, sizeValue); 
        if (sizeValue.trim() === '') {
            document.getElementById(`${size}Error`).textContent = "Field required";
            setTimeout(() => {
                document.getElementById(`${size}Error`).textContent = "";
            }, 4000);
            isValid = false;
        } else if (!validateStock(sizeValue)) {
            document.getElementById(`${size}Error`).textContent = `${size.toUpperCase()} should be in numbers`;
            setTimeout(() => {
                document.getElementById(`${size}Error`).textContent = "";
            }, 4000);
            isValid = false;
        }
    });
} else {
    let stock = document.getElementById('stock').value;
    console.log('stock value:', stock);
    if (stock.trim() === '') {
        document.getElementById('stockError').textContent = "Field required";
        setTimeout(() => {
            document.getElementById('stockError').textContent = "";
        }, 4000);
        isValid = false;
    } else if (!validateStock(stock)) {
        document.getElementById('stockError').textContent = "Stock should be in numbers";
        setTimeout(() => {
            document.getElementById('stockError').textContent = "";
        }, 4000);
        isValid = false;
    }
}
     // validating price
     if(price.trim() === ''){
        document.getElementById('priceError').textContent = "Field required"
        setTimeout(() => {
            document.getElementById('priceError').textContent = ""
        }, 4000); 
        isValid = false
    }else if(!validateStock(price)){
        document.getElementById('priceError').textContent = "Price should be in numbers"
        setTimeout(() => {
            document.getElementById('priceError').textContent = ""
        }, 4000); 
        isValid = false
    }

    // validating discount
    if(discount.trim() === ''){
        document.getElementById('discountError').textContent = "Field required"
        setTimeout(() => {
            document.getElementById('discountError').textContent = ""
        }, 4000); 
        isValid = false
    }else if(!validateStock(discount)){
        document.getElementById('discountError').textContent = "Discount should be in numbers"
        setTimeout(() => {
            document.getElementById('discountError').textContent = ""
        }, 4000); 
        isValid = false
    }


    return isValid;

}