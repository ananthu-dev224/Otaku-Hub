// Coupon Validation

// Regex
function validateCoupon(coupon) {
    const pattern = /^[A-Za-z0-9][a-zA-Z0-9]*$/
    return pattern.test(coupon)
}

function validateNumber(number) {
    const pattern = /^\d+$/
    return pattern.test(number)
}



function couponValidation() {
    let isValid = true;
    let offerName = document.getElementById('offerName').value;
    let coupon = document.getElementById('coupon').value;
    let priceRange = document.getElementById('priceRange').value;
    let discount = document.getElementById('discount').value;
    let expireDate = document.getElementById('expireDate').value;


    // Clear error content 
    document.getElementById('offerNameError').textContent = ''
    document.getElementById('couponError').textContent = ''
    document.getElementById('priceRangeError').textContent = ''
    document.getElementById('discountError').textContent = ''
    document.getElementById('expireDateError').textContent = ''


    if (offerName.trim() === '') {
        document.getElementById('offerNameError').textContent = 'Field required'
        setTimeout(() => {
            document.getElementById('offerNameError').textContent = ''
        }, 4000);
        isValid = false;
    } 

    if (coupon.trim() === '') {
        document.getElementById('couponError').textContent = 'Field required'
        setTimeout(() => {
            document.getElementById('couponError').textContent = ''
        }, 4000);
        isValid = false;
    } else if (!validateCoupon(coupon)) {
        document.getElementById('couponError').textContent = 'Only alphabets and numbers are allowed'
        setTimeout(() => {
            document.getElementById('couponError').textContent = ''
        }, 4000);
        isValid = false
    }else if (coupon.length !== 15) {
        document.getElementById('couponError').textContent = 'Length of coupon code should be 15'
        setTimeout(() => {
            document.getElementById('couponError').textContent = ''
        }, 4000);
        isValid = false
    }

    if (priceRange.trim() === '') {
        document.getElementById('priceRangeError').textContent = 'Field required'
        setTimeout(() => {
            document.getElementById('priceRangeError').textContent = ''
        }, 4000);
        isValid = false;
    }else if (!validateNumber(priceRange)) {
        document.getElementById('priceRangeError').textContent = 'Value should be a number'
        setTimeout(() => {
            document.getElementById('priceRangeError').textContent = ''
        }, 4000);
        isValid = false
    }

    if (discount.trim() === '') {
        document.getElementById('discountError').textContent = 'Field required'
        setTimeout(() => {
            document.getElementById('discountError').textContent = ''
        }, 4000);
        isValid = false;
    } else if (!validateNumber(discount)) {
        document.getElementById('discountError').textContent = 'Value should be a number'
        setTimeout(() => {
            document.getElementById('discountError').textContent = ''
        }, 4000);
        isValid = false
    }

    if (expireDate.trim() === '') {
        document.getElementById('expireDateError').textContent = 'Field required'
        setTimeout(() => {
            document.getElementById('expireDateError').textContent = ''
        }, 4000);
        isValid = false;
    }

    

    return isValid;
}