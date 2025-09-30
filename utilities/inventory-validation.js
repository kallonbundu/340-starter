const { body, validationResult } = require("express-validator")
const utilities = require("./index")

// Classification validation
exports.classificationRules = () => [
  body("classification_name")
    .trim()
    .notEmpty().withMessage("Classification name is required.")
    .matches(/^[A-Za-z0-9]+$/).withMessage("No spaces or special characters allowed."),
]

exports.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      message: null,
      errors: errors.array(),
    })
    return
  }
  next()
}

// Inventory validation
exports.inventoryRules = () => [
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_year").isInt({ min: 1900, max: 2099 }).withMessage("Year must be between 1900 and 2099."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
  body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a positive integer."),
  body("inv_color").trim().notEmpty().withMessage("Color is required."),
  body("classification_id").isInt().withMessage("Classification is required."),
]

exports.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    res.render("inventory/add-inventory", {
      title: "Add Inventory Item",
      nav,
      classificationList,
      message: null,
      errors: errors.array(),
      sticky: { ...req.body },
    })
    return
  }
  next()
}
