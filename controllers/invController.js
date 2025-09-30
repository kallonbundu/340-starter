
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")


const invCont = {}

// Management View
invCont.managementView = async function (req, res) {
  const nav = await utilities.getNav()
  const message = req.flash ? req.flash("message") : null
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: message && message.length ? message[0] : null
  })
}

// Add Classification View
invCont.addClassificationView = async function (req, res) {
  const nav = await utilities.getNav()
  const message = req.flash ? req.flash("message") : null
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    message: message && message.length ? message[0] : null,
    errors: [],
  })
}

// Add Classification POST
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body
  try {
    const result = await invModel.addClassification(classification_name)
    if (result) {
      req.flash("message", "Classification added successfully!")
      return res.redirect("/inv/")
    } else {
      const nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        message: "Failed to add classification.",
        errors: []
      })
    }
  } catch (err) {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      message: "Error adding classification.",
      errors: [{ msg: err.message }]
    })
  }
}

// Add Inventory View
invCont.addInventoryView = async function (req, res) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  const message = req.flash ? req.flash("message") : null
  res.render("inventory/add-inventory", {
    title: "Add Inventory Item",
    nav,
    classificationList,
    message: message && message.length ? message[0] : null,
    errors: [],
    sticky: {},
  })
}

// Add Inventory POST
invCont.addInventory = async function (req, res) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)
  const sticky = { ...req.body }
  try {
    const result = await invModel.addInventory(req.body)
    if (result) {
      req.flash("message", "Inventory item added successfully!")
      return res.redirect("/inv/")
    } else {
      res.render("inventory/add-inventory", {
        title: "Add Inventory Item",
        nav,
        classificationList,
        message: "Failed to add inventory item.",
        errors: [],
        sticky
      })
    }
  } catch (err) {
    res.render("inventory/add-inventory", {
      title: "Add Inventory Item",
      nav,
      classificationList,
      message: "Error adding inventory item.",
      errors: [{ msg: err.message }],
      sticky
    })
  }
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    if (!data || data.length === 0) {
      return res.status(404).render("inventory/noData", {
        title: "No Vehicles Found",
        message: "Sorry, no vehicles were found for this classification.",
        nav: await utilities.getNav()
      })
    }
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (error) {
    console.error("Error in buildByClassificationId:", error)
    next(error)
  }
}

/* ***************************
 *  Build vehicle detail view
 *  Assignment 3, Task 1
 * ************************** */
invCont.buildDetail = async function (req, res, next) {
  const invId = req.params.id
  let vehicle = await invModel.getInventoryById(invId)
  const htmlData = await utilities.buildSingleVehicleDisplay(vehicle)
  let nav = await utilities.getNav()
  const vehicleTitle =
    vehicle.inv_year + " " + vehicle.inv_make + " " + vehicle.inv_model
  res.render("./inventory/detail", {
    title: vehicleTitle,
    nav,
    message: null,
    htmlData,
  })
}

/* ****************************************
 *  Process intentional error
 *  Assignment 3, Task 3
 * ************************************ */
invCont.throwError = async function (req, res) {
  throw new Error("I am an intentional error")
}


module.exports = invCont