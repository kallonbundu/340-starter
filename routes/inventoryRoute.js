// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")


// Inventory Management View
router.get("/", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.managementView));

// Add Classification
const { classificationRules, checkClassificationData } = require("../utilities/inventory-validation");
router.get("/add-classification", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.addClassificationView));
router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAccountType,
  classificationRules(),
  checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Add Inventory
const { inventoryRules, checkInventoryData } = require("../utilities/inventory-validation");
router.get("/add-inventory", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.addInventoryView));
router.post(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAccountType,
  inventoryRules(),
  checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

router.get("/type/:classificationId", invController.buildByClassificationId);


/* ****************************************
 * Route to build vehicle detail view
 **************************************** */
router.get("/detail/:id", 
utilities.handleErrors(invController.buildDetail))

/* ****************************************
 * Routes for editing inventory
 **************************************** */
// Get inventory items for editing (JSON response)
router.get("/getInventory/:classification_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON))

// Edit inventory view
router.get("/edit/:inv_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.editInventoryView))

// Update inventory
router.post("/update/", 
  utilities.checkLogin, 
  utilities.checkAccountType,
  inventoryRules(),
  checkInventoryData,
  utilities.handleErrors(invController.updateInventory)
)

// Delete inventory view
router.get("/delete/:inv_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.deleteInventoryView))

// Delete inventory
router.post("/delete/", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.deleteInventory))

/* ****************************************
 * Error Route
 * Assignment 3, Task 3
 **************************************** */
router.get(
  "/broken",
  utilities.handleErrors(invController.throwError)
)


module.exports = router; // End of routes/inventoryRoute.js