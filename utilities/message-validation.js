const { body, validationResult } = require("express-validator")
const utilities = require(".")
const validate = {}

/*  **********************************
 *  Message Data Validation Rules
 * ********************************* */
validate.messageRules = () => {
  return [
    // Recipient is required and must be a valid integer
    body("message_to")
      .trim()
      .notEmpty()
      .withMessage("Please select a recipient.")
      .isInt({ min: 1 })
      .withMessage("Invalid recipient selected.")
      .escape(),

    // Subject is required and must be string with length 1-255
    body("message_subject")
      .trim()
      .notEmpty()
      .withMessage("Please provide a message subject.")
      .isLength({ min: 1, max: 255 })
      .withMessage("Subject must be between 1 and 255 characters.")
      .escape(),

    // Message body is required
    body("message_body")
      .trim()
      .notEmpty()
      .withMessage("Please provide a message body.")
      .isLength({ min: 1 })
      .withMessage("Message body cannot be empty.")
  ]
}

/* ******************************
 * Check data and return errors or continue to send message
 * ***************************** */
validate.checkMessageData = async (req, res, next) => {
  const { message_to, message_subject, message_body } = req.body || {}
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const messageModel = require("../models/message-model")
    const recipients = await messageModel.getAvailableRecipients(res.locals.accountData.account_id)
    const unreadCount = await messageModel.getUnreadCount(res.locals.accountData.account_id)
    
    res.render("messages/compose", {
      errors,
      title: "Compose New Message",
      nav,
      message_to,
      message_subject,
      message_body,
      recipients,
      unreadCount
    })
    return
  }
  next()
}

module.exports = validate