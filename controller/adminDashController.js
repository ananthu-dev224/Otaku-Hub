//Admin Dashboard controller
const ordersdb = require('../model/ordersSchema')
const productsdb = require('../model/productSchema')
const categorydb = require('../model/categorySchema')
const usersdb = require('../model/userSchema')
const pdf = require('pdfkit')
const fs = require('fs')
const exceljs = require('exceljs');
const admDashC = {}

// Function for doughnut 
async function chart() {
  try {
    // Find order count based on status for pie chart
    const ordersPie = await ordersdb.find()
    const ordersCount = {
      pending: 0,
      shipped: 0,
      processing: 0,
      delivered: 0,
      returned: 0,
    }

    ordersPie.forEach((order) => {
      if (order.orderStatus === 'Pending') {
        ordersCount.pending++
      } else if (order.orderStatus === 'Shipped') {
        ordersCount.shipped++
      } else if (order.orderStatus === 'Processing') {
        ordersCount.processing++
      } else if (order.orderStatus === 'Delivered' || order.orderStatus === 'Request declined') {
        ordersCount.delivered++
      } else if (order.orderStatus === 'Returned') {
        ordersCount.returned++
      }
    })

    return ordersCount;
  } catch (error) {
    console.log("An error occured in orders count function chart", error.message);
  }
}

// Function for getting count of orders based on months
async function graph() {
  try {
    const ordersCountByMonth = await ordersdb.aggregate([
      {
        $project: {
          month: { $month: '$date' }, // extract the month from the date field
        },
      },
      {
        $group: {
          _id: '$month',
          count: { $sum: 1 }, // count the number of orders for each month
        },
      },
      {
        $sort: { _id: 1 }, // sort by month
      },
    ]);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Map numeric month IDs to month names in the result
    const ordersCountByMonthWithNames = ordersCountByMonth.map(entry => ({
      month: months[entry._id - 1], // Convert numeric month ID to month name
      count: entry.count,
    }));


    const labels = ordersCountByMonthWithNames.map((val) => val.month)
    const count = ordersCountByMonthWithNames.map((val) => val.count)
    return {
      labels: labels,
      count: count
    }
  } catch (error) {
    console.log('Error retrieving orders in graph function:', error.message);
  }
}

// Function for current month weekly sales
async function barGraph() {
  try {
    const currentMonth = new Date().getMonth() + 1; // Get the current month (1-based)
    const currentYear = new Date().getFullYear(); // Get the current year

    const ordersCountByWeek = await ordersdb.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${currentYear}-${currentMonth}-01`),
            $lt: new Date(`${currentYear}-${currentMonth + 1}-01`)
          }
        }
      },
      {
        $project: {
          week: { $isoWeek: '$date' }, // extract the ISO week from the date field
        },
      },
      {
        $group: {
          _id: '$week',
          count: { $sum: 1 }, // count the number of orders for each week
        },
      },
      {
        $sort: { _id: 1 }, // sort by week
      },
    ]);

    // Assuming you have a function to map ISO weeks to corresponding weeks in your application
    const mapIsoWeekToWeek = isoWeek => {
      return `Week ${isoWeek}`;
    };

    // Map ISO week IDs to week names in the result
    const ordersCountByWeekWithNames = ordersCountByWeek.map(entry => ({
      week: mapIsoWeekToWeek(entry._id),
      count: entry.count,
    }));



    const labels = ordersCountByWeekWithNames.map(val => val.week);
    const count = ordersCountByWeekWithNames.map(val => val.count);

    return {
      labels: labels,
      count: count
    };


  } catch (error) {
    console.log('Error retrieving orders in barGraph function:', error.message);
  }
}




// Get sales data daily , weekly , monthly and yearly
admDashC.displayadminDash = async (req, res) => {
  try {
    const orders = await ordersdb.aggregate([
      {
        $match: {
          orderStatus: { $in: ['Delivered', 'Request declined'] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);
    const [
      ordersData,
      totalOrders,
      totalProducts,
      totalCategory,
      totalUsers,
      ordersPie,
      ordersGraph,
      ordersBarGraph
    ] = await Promise.all([
      ordersdb.find({ orderStatus: { $in: ['Delivered', 'Request declined'] } }).populate('products.productId'),
      ordersdb.countDocuments({ orderStatus: { $in: ['Delivered', 'Request declined'] } }),
      productsdb.countDocuments(),
      categorydb.countDocuments(),
      usersdb.countDocuments(),
      chart(),
      graph(),
      barGraph()
  ]);
  ;
    const labels = [...ordersGraph.labels] // months 
    const count = [...ordersGraph.count] // orders in each month
    const weeks = [...ordersBarGraph.labels] // weeks
    const weekCount = [...ordersBarGraph.count] // orders in each week corresponding to current month  

    // Extract the totalRevenue from the result array
    const totalRevenue = orders.length > 0 ? orders[0].totalRevenue : 0;
    res.render('adminPanel', { totalRevenue, totalOrders, totalCategory, totalProducts, totalUsers, ordersPie, labels, count, weeks, weekCount, ordersData })
  } catch (error) {
    res.render("error")
    console.log("An error occured while loading admin dashboard", error.message);
  }
}



// Filter Sales Report
admDashC.filterSales = async (req, res) => {
  try {
    const value = req.query.by
    const today = new Date()

    if (value === 'all') {

      // Finding data using aggregate
      const orders = await ordersdb.aggregate([
        {
            $match: { orderStatus: { $in: ['Delivered', 'Request declined'] } },
        },
        {
            $sort: { deliveredDate: -1 },
        },
    ]);
    


      res.json({ orders });

    } else if (value === 'today') {

      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Finding data using aggregate
      const orders = await ordersdb.aggregate([
        {
          $match: {
            orderStatus: { $in: ['Delivered', 'Request declined'] },
            deliveredDate: {
              $gte: startOfDay,
              $lt: endOfDay
            }
          }
        },
        {
          $project: {
            deliveredDate: 1,
            totalAmount: 1,
            products: 1,
            address: 1,
            trackingId: 1,
          }
        },
        { $sort: { deliveredDate: -1 } }
      ]);
      res.json({ orders });

    } else if (value === 'weekly') {

      const currentDay = today.getDay();
      const startofWeek = new Date(today)
      startofWeek.setDate(today.getDate() - currentDay) // We will get the sunday "0"

      const endofWeek = new Date(today)
      endofWeek.setDate(today.getDate() + 6 - currentDay); // we will get the saturday it means "6"

      const orders = await ordersdb.aggregate([
        {
          $match: {
            orderStatus: { $in: ['Delivered', 'Request declined'] },
            deliveredDate: {
              $gte: startofWeek,
              $lte: endofWeek
            }
          }
        },
        {
          $project: {
            deliveredDate: 1,
            totalAmount: 1,
            products: 1,
            address: 1,
            trackingId: 1,
          }
        },
        { $sort: { deliveredDate: -1 } }
      ])
      res.json({ orders });

    } else if (value === 'monthly') {

      // Finding data using aggregate
      const startofMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endofMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999); //last day in milliseconds

      const orders = await ordersdb.aggregate([
        {
          $match: {
            orderStatus: { $in: ['Delivered', 'Request declined'] },
            deliveredDate: {
              $gte: startofMonth,
              $lte: endofMonth
            }
          }
        },
        {
          $project: {
            deliveredDate: 1,
            totalAmount: 1,
            products: 1,
            address: 1,
            trackingId: 1,
          }
        },
        { $sort: { deliveredDate: -1 } }
      ])
      res.json({ orders });
    } else if (value === 'yearly') {

      const startOfYear = new Date(today.getFullYear(), 0, 1); // January is 0
      const endOfYear = new Date(today.getFullYear() + 1, 0, 0, 23, 59, 59, 999); // December 31, last millisecond

      const orders = await ordersdb.aggregate([
        {
          $match: {
            orderStatus: { $in: ['Delivered', 'Request declined'] },
            deliveredDate: {
              $gte: startOfYear,
              $lte: endOfYear
            }
          }
        },
        {
          $project: {
            deliveredDate: 1,
            totalAmount: 1,
            products: 1,
            address: 1,
            trackingId: 1,
          }
        },
        { $sort: { deliveredDate: -1 } }
      ])
      res.json({ orders });

    }
  } catch (error) {
    console.log("An error occured while filtering sales by dropdown", error.message);
  }
}


admDashC.filterByDate = async (req, res) => {
  try {
    let { startingDate, endingDate } = req.body;

    startingDate = new Date(startingDate);
    endingDate = new Date(endingDate);

    const orders = await ordersdb.aggregate([
      {
        $match: {
          orderStatus: { $in: ['Delivered', 'Request declined'] },
          deliveredDate: {
            $gte: startingDate,
            $lte: endingDate
          }
        }
      },
      {
        $project: {
          deliveredDate: 1,
          totalAmount: 1,
          address: 1,
          trackingId: 1,
        }
      },
      { $sort: { deliveredDate: -1 } }
    ])
    res.json({ orders });
  } catch (error) {
    console.log("An error occured while filtering sales by date from form", error.message);
  }
}

// Generate sales report in pdf
admDashC.generateSalesPdf = async (req, res) => {
  try {
    const salesData = req.body;
    const pdfDoc = new pdf();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sales-report.pdf`);

    pdfDoc.pipe(res);
    pdfDoc.fontSize(12);
    let title = `Sales Report - Otaku Hub`;
    let subtitle;
    salesData.forEach(entry => {
      if (entry.startingDate && entry.endingDate) {
        subtitle = `Data from ${entry.startingDate} to ${entry.endingDate}`;  // Add your desired subtitle text
      } else {
        subtitle = `${entry.filterDrop.toUpperCase()} Sales`;  // Add your desired subtitle text
      }
    })
    pdfDoc.text(title, { align: 'center', underline: true });
    pdfDoc.moveDown();  // Move down after the title

    pdfDoc.text(subtitle, { align: 'center' });  // Add the subtitle
    pdfDoc.moveDown();
    let totalOrders = 0;
    let totalAmount = 0;
    const tableHeaders = ['Order ID', 'Total Amount (Rs)', 'Delivered Date'];

    // Set up initial positions
    let tableX = 50;
    let tableY = pdfDoc.y + 40;

    // Draw table headers
    tableHeaders.forEach(header => {
      pdfDoc.text(header, tableX, tableY, { width: 150, align: 'left' });
      tableX += 150; // Adjust the width as needed
    });

    // Move to the next row
    tableY += 20; // Adjust the row height as needed

    salesData.forEach(entry => {
      tableX = 50; // Reset X-coordinate for each row

      pdfDoc.text(entry.orderId, tableX, tableY, { width: 150, align: 'left' });
      tableX += 150;

      pdfDoc.text(`Rs:${entry.totalAmount}`, tableX, tableY, { width: 150, align: 'left' });
      tableX += 150;

      pdfDoc.text(entry.date, tableX, tableY, { width: 150, align: 'left' });

      // Update totalOrders and totalAmount
      totalOrders += 1;
      totalAmount += entry.totalAmount;

      // Move to the next row
      tableY += 20; // Adjust the row height as needed
    });

    pdfDoc.moveDown();
    pdfDoc.moveDown();
    pdfDoc.moveDown();
    pdfDoc.text(`Total Orders: ${totalOrders}`);
    pdfDoc.text(`Total Amount: Rs:${totalAmount}`);
    pdfDoc.end();
  } catch (error) {
    console.log("An error occured while downloading pdf report", error.message);
  }
}

// generate excel report
admDashC.generateSalesExcel = async (req, res) => {
  try {
      const salesData = req.body;

      // Create a new Excel workbook
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');

      // Define the columns in the Excel sheet
      worksheet.columns = [
          { header: 'Order ID', key: 'orderId', width: 15 },
          { header: 'Total Amount (Rs)', key: 'totalAmount', width: 20 },
          { header: 'Delivered Date', key: 'date', width: 15 }
      ];

      // Add data to the worksheet
      salesData.forEach(entry => {
          worksheet.addRow({
              orderId: entry.orderId,
              totalAmount: `Rs:${entry.totalAmount}`,
              date: entry.date
          });
      });

      // Set up totalOrders and totalAmount
      let totalOrders = salesData.length;
      let totalAmount = salesData.reduce((total, entry) => total + entry.totalAmount, 0);

       // Add a row for totalOrders and totalAmount
       worksheet.addRow({ orderId: 'Total Orders', totalAmount: totalOrders, date: '' });
       worksheet.addRow({ orderId: 'Total Amount', totalAmount: `Rs:${totalAmount}`, date: '' });

      // Return the Excel workbook
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=sales-report.xlsx`);

      // Write the workbook to the response
      await workbook.xlsx.write(res);

      // End the response
      res.end();
  } catch (error) {
      console.log("An error occurred while downloading Excel report", error.message);
  }
};




module.exports = admDashC