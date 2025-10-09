const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")


const invCont = {}

// Management View
invCont.managementView = async function (req, res) {
  const nav = await utilities.getNav()
  const classifications = await invModel.getClassifications()
  const message = req.flash ? req.flash("message") : null
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classifications: classifications.rows,
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
 *  Return Inventory by Classification As JSON
 * **************************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ****************************************
 *  Build edit inventory view
 * **************************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ****************************************
 *  Update Inventory Data
 * **************************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ****************************************
 *  Build delete inventory view
 * **************************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  })
}

/* ****************************************
 *  Delete Inventory Data
 * **************************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)
  
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("notice", 'The deletion was successful.')
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect("/inv/delete/" + inv_id)
  }
}

/* ****************************************
 *  Process intentional error
 *  Assignment 3, Task 3
 * ************************************ */
invCont.throwError = async function (req, res) {
  throw new Error("I am an intentional error")
}

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inv_id
  const data = await invModel.getInventoryByInventoryId(inv_id)
  
  const grid = await utilities.buildSingleVehicleDisplay(data) // Make sure this matches the function name in utilities
  let nav = await utilities.getNav()
  const className = data.inv_make + " " + data.inv_model
  res.render("./inventory/detail", {
    title: className,
    nav,
    grid,
  })
}


module.exports = invCont