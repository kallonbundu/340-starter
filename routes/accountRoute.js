// Account routes
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const regValidate = require("../utilities/account-validation")
const accountController = require("../controllers/accountController")

// Route for login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route for registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Default account route (account management)
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

// Process the registration data
router.post(
	"/register",
	regValidate.registationRules(),
	regValidate.checkRegData,
	utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router
