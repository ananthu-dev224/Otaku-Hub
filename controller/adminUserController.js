//Controller for view users and other functions


const User = require('../model/userSchema')
const admUsersC = {}

// User management page
admUsersC.displayUsers = async (req, res) => {
    try {
        const perPage = 10; // Number of users per page
        const currentPage = parseInt(req.query.page) || 1; // Get the page from the query parameter, default to 1

        const totalUsers = await User.countDocuments({});
        const totalPages = Math.ceil(totalUsers / perPage);

        const users = await User.find()
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
            .exec();

        res.render('customers', { users, currentPage, totalPages, search: null });

    } catch (error) {
        console.log('An error occured while displaying users', error.message)
        res.render('error')
    }
}

// Block and unblock user
admUsersC.manageToggleUser = async (req, res) => {
    try {
        const id = req.params.id
        const customer = await User.findById(id)
        if (!customer) {
            res.status(404).send("User not found , Server Error")
        }
        customer.isBlocked = !customer.isBlocked  //switches the state of whether the customer is blocked or not
        await customer.save()
        res.redirect('/admin/view-users')

    } catch (error) {
        console.log("Error occured during toggling user", error.message);
        res.render('error')

    }
}


// Admin search users data
admUsersC.searchUser = async (req, res) => {
    try {
        const perPage = 10; // Number of users per page
        const currentPage = parseInt(req.query.page) || 1; // Get the page from the query parameter, default to 1

        const { name } = req.query;

        if (!name) {
            res.redirect('/admin/view-users');
        }

        const regex = new RegExp(`^${name}.*`, 'i');

        const totalUsers = await User.countDocuments({ name: regex });
        const totalPages = Math.ceil(totalUsers / perPage);

        const users = await User.find({ name: regex })
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
            .exec();

        res.render('customers', { users, currentPage, totalPages, search:name });

    } catch (err) {
        console.log("An error occured during searching user", err.message);
        res.render('error')
    }
}


module.exports = admUsersC