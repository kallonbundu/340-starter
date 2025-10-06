const Util = {}
const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Build classification select list for add-inventory form
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}





/* ************************


 * Constructs the nav HTML unordered list


 ************************** */


Util.getNav = async function (req, res, next) {


  let data = await invModel.getClassifications()


  let list = "<ul>"


  list += '<li><a href="/" title="Home page">Home</a></li>'


  data.rows.forEach((row) => {


    list += "<li>"


    list +=


      '<a href="/inv/type/' +


      row.classification_id +


      '" title="See our inventory of ' +


      row.classification_name +


      ' vehicles">' +


      row.classification_name +


      "</a>"


    list += "</li>"


  })


  list += "</ul>"


  return list


}








/* **************************************


* Build the classification view HTML


* ************************************ */


Util.buildClassificationGrid = async function(data){
    let grid = "";
    if(Array.isArray(data) && data.length > 0){
      grid = '<ul id="inv-display">';
      data.forEach(vehicle => {
        // Use absolute path for images
        let thumb = vehicle.inv_thumbnail;
        if (thumb && !thumb.startsWith("/")) {
          thumb = "/" + thumb;
        }
        grid += '<li>';
        grid +=  '<a href="/inv/detail/' + vehicle
        grid += '<img src="' + thumb + '" alt="' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model + ', ' + vehicle.inv_color + '">';
        grid += '</a>';
        grid += '<div class="namePrice">';
        grid += '<hr />';
        grid += '<h2>' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h2>';
        grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
        grid += '</div>';
        grid += '</li>';
      });
      grid += '</ul>';
    } else {
      grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return grid;
}


/* ****************************************
 * Build the vehicle detail HTML
 * Assignment 3, Task 1
 **************************************** */
Util.buildSingleVehicleDisplay = async (vehicle) => {
  let svd = '<section id="vehicle-display">'
  svd += "<div>"
  svd += '<section class="imagePrice">'
  svd +=
    "<img src='" +
    vehicle.inv_image +
    "' alt='Image of " +
    vehicle.inv_make +
    " " +
    vehicle.inv_model +
    " on cse motors' id='mainImage'>"
  svd += "</section>"
  svd += '<section class="vehicleDetail">'
  svd += "<h3> " + vehicle.inv_make + " " + vehicle.inv_model + " Details</h3>"
  svd += '<ul id="vehicle-details">'
  svd +=
    "<li><h4>Price: $" +
    new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
    "</h4></li>"
  svd += "<li><h4>Description:</h4> " + vehicle.inv_description + "</li>"
  svd += "<li><h4>Color:</h4> " + vehicle.inv_color + "</li>"
  svd +=
    "<li><h4>Miles:</h4> " +
    new Intl.NumberFormat("en-US").format(vehicle.inv_miles) +
    "</li>"
  svd += "</ul>"
  svd += "</section>"
  svd += "</div>"
  svd += "</section>"
  return svd
}






/* ****************************************


 * Middleware For Handling Errors


 * Wrap other function in this for 


 * General Error Handling


 **************************************** */


Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

module.exports = {
  ...Util
}