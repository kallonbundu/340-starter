// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")


// Inventory Management View
router.get("/", utilities.handleErrors(invController.managementView));

// Add Classification
const { classificationRules, checkClassificationData } = require("../utilities/inventory-validation");
router.get("/add-classification", utilities.handleErrors(invController.addClassificationView));
router.post(
  "/add-classification",
  classificationRules(),
  checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Add Inventory
const { inventoryRules, checkInventoryData } = require("../utilities/inventory-validation");
router.get("/add-inventory", utilities.handleErrors(invController.addInventoryView));
router.post(
  "/add-inventory",
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
 * Error Route
 * Assignment 3, Task 3
 **************************************** */
router.get(
  "/broken",
  utilities.handleErrors(invController.throwError)
)


module.exports = router; // End of routes/inventoryRoute.js