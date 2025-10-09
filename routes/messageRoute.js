const express = require("express")
const router = new express.Router()
const messageController = require("../controllers/messageController")
const utilities = require("../utilities/")
const messageValidate = require('../utilities/message-validation')

// Middleware to check if user is logged in - applies to all message routes
router.use(utilities.checkLogin)

// Route to build inbox view
router.get(
  "/inbox", 
  utilities.handleErrors(messageController.buildInbox)
)

// Route to build archived messages view
router.get(
  "/archived", 
  utilities.handleErrors(messageController.buildArchived)
)

// Route to build sent messages view
router.get(
  "/sent", 
  utilities.handleErrors(messageController.buildSent)
)

// Route to build compose message view
router.get(
  "/compose", 
  utilities.handleErrors(messageController.buildCompose)
)

// Route to process message sending with validation
router.post(
  "/send",
  messageValidate.messageRules(),
  messageValidate.checkMessageData,
  utilities.handleErrors(messageController.sendMessage)
)

// Route to read a specific message
router.get(
  "/read/:messageId", 
  utilities.handleErrors(messageController.readMessage)
)

// Route to mark message as read
router.post(
  "/mark-read/:messageId", 
  utilities.handleErrors(messageController.markRead)
)

// Route to mark message as unread
router.post(
  "/mark-unread/:messageId", 
  utilities.handleErrors(messageController.markUnread)
)

// Route to archive message
router.post(
  "/archive/:messageId", 
  utilities.handleErrors(messageController.archiveMessage)
)

// Route to unarchive message
router.post(
  "/unarchive/:messageId", 
  utilities.handleErrors(messageController.unarchiveMessage)
)

// Route to delete message
router.post(
  "/delete/:messageId", 
  utilities.handleErrors(messageController.deleteMessage)
)

module.exports = router