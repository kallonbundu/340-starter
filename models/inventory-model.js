const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}



/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get inventory and classification data by inv_id
 *   * ************************** */
async function getInventoryById(invId) {
  try {
    const data = await pool.query(
      "SELECT * FROM public.inventory AS i JOIN public.classification AS c ON i.classification_id = c.classification_id WHERE i.inv_id = $1",
      [invId]
    )
    return data.rows[0]
  } catch (error) {
    console.error(error)
  }
}


// Add new classification
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    const data = await pool.query(sql, [classification_name])
    return data.rows[0]
  } catch (error) {
    throw new Error("Classification insert failed: " + error.message)
  }
}

// Add new inventory item
async function addInventory(inv) {
  try {
    const sql = `INSERT INTO public.inventory
      (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`
    const values = [
      inv.inv_make,
      inv.inv_model,
      inv.inv_year,
      inv.inv_description,
      inv.inv_image,
      inv.inv_thumbnail,
      inv.inv_price,
      inv.inv_miles,
      inv.inv_color,
      inv.classification_id
    ]
    const data = await pool.query(sql, values)
    return data.rows[0]
  } catch (error) {
    throw new Error("Inventory insert failed: " + error.message)
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  addClassification,
  addInventory
};