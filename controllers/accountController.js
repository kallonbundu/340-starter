const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const messageModel = require("../models/message-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }

/* ****************************************
*  Deliver account management view
**************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildUpdate(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(account_id)
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

/* ****************************************
*  Process account update
* *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_id,
  } = req.body
  
  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  if (updateResult) {
    const accountData = await accountModel.getAccountById(account_id)
    delete accountData.account_password
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
    if(process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    
    req.flash("notice", `Account updated successfully.`)
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
*  Process password change
* *************************************** */
async function changePassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the password change.')
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
    })
  }

  const updateResult = await accountModel.changePassword(hashedPassword, account_id)

  if (updateResult) {
    req.flash("notice", `Password changed successfully.`)
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the password change failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
*  Process logout
* *************************************** */
async function logout(req, res, next) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  buildAccountManagement,
  registerAccount,
  accountLogin,
  buildAccountUpdate: buildUpdate,     // Alias to match route
  updateAccount,
  updatePassword: changePassword,      // Alias to match route
  accountLogout: logout                // Alias to match route
}
