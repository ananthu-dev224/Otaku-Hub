const updateStock = async (orderData) => {
  for (const product of orderData.products) {
    let stockToIncrease;

    if (product.size !== null) {
      stockToIncrease = product.productId.quantity.find((entry) => entry.size === product.size);
    } else {
      stockToIncrease = product.productId.quantity[0];
    }

    if (stockToIncrease) {
      stockToIncrease.stock += product.quantity;
      await product.productId.save();
      console.log(`Stock added back for product ${product.productId} with size ${stockToIncrease.size}: ${stockToIncrease.stock}`);
    } else {
      console.log('Cannot get the stock for the product');
    }
  }
};

const reduceStock = async (cart) => {
  let stockToReduce
  for (const product of cart.products) {
    if (product.size !== null) {
      stockToReduce = product.productId.quantity.find((entry) => entry.size === product.size);
      if (stockToReduce) {
        stockToReduce.stock -= product.quantity;
        await product.productId.save();
        console.log("stock reduced in product with size", stockToReduce.stock);
      } else {
        console.log('Cannot get the stock for size present products');
      }
    } else {
      stockToReduce = product.productId.quantity[0]
      if (stockToReduce) {
        stockToReduce.stock -= product.quantity;
        await product.productId.save();
        console.log("stock reduced in product without size", stockToReduce.stock);
      } else {
        console.log('Cannot get the stock for  products without size');
      }
    }
  };
}





module.exports = { updateStock, reduceStock };
