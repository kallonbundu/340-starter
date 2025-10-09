const messageModel = require("../models/message-model")
const utilities = require("../utilities/")

const messageController = {}

/* ***************************
 *  Build inbox view
 * ************************** */
messageController.buildInbox = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const messages = await messageModel.getInboxMessages(account_id)
    const unreadCount = await messageModel.getUnreadCount(account_id)
    const archivedCount = await messageModel.getArchivedCount(account_id)
    
    let nav = await utilities.getNav()
    res.render("messages/inbox", {
      title: "Inbox",
      nav,
      messages: res.locals.messages, // Add this line
      messageList: messages,
      unreadCount,
      archivedCount,
      errors: null,
    })
  } catch (error) {
    console.error("Error building inbox:", error)
    req.flash("notice", "Sorry, there was an error loading your inbox.")
    res.redirect("/account/")
  }
}

/* ***************************
 *  Build archived messages view
 * ************************** */
messageController.buildArchived = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const messages = await messageModel.getArchivedMessages(account_id)
    const unreadCount = await messageModel.getUnreadCount(account_id)
    const archivedCount = await messageModel.getArchivedCount(account_id)
    
    let nav = await utilities.getNav()
    res.render("messages/archived", {
      title: "Archived Messages",
      nav,
      messages: res.locals.messages, // Add this line
      messageList: messages,
      unreadCount,
      archivedCount,
      errors: null,
    })
  } catch (error) {
    console.error("Error building archived view:", error)
    req.flash("notice", "Sorry, there was an error loading your archived messages.")
    res.redirect("/account/")
  }
}

/* ***************************
 *  Build sent messages view
 * ************************** */
messageController.buildSent = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const messages = await messageModel.getSentMessages(account_id)
    const unreadCount = await messageModel.getUnreadCount(account_id)
    
    let nav = await utilities.getNav()
    res.render("messages/sent", {
      title: "Sent Messages",
      nav,
      messages: res.locals.messages, // Add this line
      messageList: messages,
      unreadCount,
      errors: null,
    })
  } catch (error) {
    console.error("Error building sent view:", error)
    req.flash("notice", "Sorry, there was an error loading your sent messages.")
    res.redirect("/account/")
  }
}

/* ***************************
 *  Build compose message view
 * ************************** */
messageController.buildCompose = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const recipients = await messageModel.getAvailableRecipients(account_id)
    const unreadCount = await messageModel.getUnreadCount(account_id)
    
    // Check if replying to a message
    const replyTo = req.query.replyTo
    let message_to = ""
    let message_subject = ""
    let message_body = ""
    
    if (replyTo) {
      const originalMessage = await messageModel.getMessageById(replyTo, account_id)
      if (originalMessage) {
        message_to = originalMessage.sender_id
        message_subject = originalMessage.message_subject.startsWith("Re: ") 
          ? originalMessage.message_subject 
          : "Re: " + originalMessage.message_subject
        message_body = "\n\n--- Original Message ---\n" + originalMessage.message_body
      }
    }
    
    let nav = await utilities.getNav()
    res.render("messages/compose", {
      title: "Compose New Message",
      nav,
      recipients,
      unreadCount,
      message_to,
      message_subject,
      message_body,
      errors: null,
    })
  } catch (error) {
    console.error("Error building compose view:", error)
    req.flash("notice", "Sorry, there was an error loading the compose form.")
    res.redirect("/messages/inbox")
  }
}

/* ***************************
 *  Process message sending
 * ************************** */
messageController.sendMessage = async function (req, res, next) {
  try {
    const { message_to, message_subject, message_body } = req.body
    const message_from = res.locals.accountData.account_id
    
    const result = await messageModel.sendMessage(
      message_to,
      message_from,
      message_subject,
      message_body
    )
    
    if (result && result.message_id) {
      req.flash("notice", "Message sent successfully!")
      res.redirect("/messages/inbox")
    } else {
      req.flash("notice", "Sorry, sending the message failed. Please try again.")
      res.redirect("/messages/compose")
    }
  } catch (error) {
    console.error("Error sending message:", error)
    req.flash("notice", "Sorry, there was an error sending your message.")
    res.redirect("/messages/compose")
  }
}

/* ***************************
 *  Build read message view
 * ************************** */
messageController.readMessage = async function (req, res, next) {
  try {
    const message_id = parseInt(req.params.messageId)
    const account_id = res.locals.accountData.account_id
    
    const message = await messageModel.getMessageById(message_id, account_id)
    
    if (!message) {
      req.flash("notice", "Message not found or you don't have permission to view it.")
      return res.redirect("/messages/inbox")
    }
    
    // Automatically mark as read if recipient is viewing
    if (message.message_to === account_id && !message.message_read) {
      await messageModel.markAsRead(message_id, account_id)
      message.message_read = true
    }
    
    const unreadCount = await messageModel.getUnreadCount(account_id)
    let nav = await utilities.getNav()
    
    res.render("messages/read", {
      title: message.message_subject,
      nav,
      message,
      unreadCount,
      errors: null,
    })
  } catch (error) {
    console.error("Error reading message:", error)
    req.flash("notice", "Sorry, there was an error loading the message.")
    res.redirect("/messages/inbox")
  }
}

/* ***************************
 *  Mark message as read
 * ************************** */
messageController.markRead = async function (req, res, next) {
  try {
    const message_id = parseInt(req.params.messageId)
    const account_id = res.locals.accountData.account_id
    
    await messageModel.markAsRead(message_id, account_id)
    req.flash("notice", "Message marked as read.")
    res.redirect(`/messages/read/${message_id}`)
  } catch (error) {
    console.error("Error marking message as read:", error)
    req.flash("notice", "Sorry, there was an error updating the message.")
    res.redirect("/messages/inbox")
  }
}

/* ***************************
 *  Mark message as unread
 * ************************** */
messageController.markUnread = async function (req, res, next) {
  try {
    const message_id = parseInt(req.params.messageId)
    const account_id = res.locals.accountData.account_id
    
    await messageModel.markAsUnread(message_id, account_id)
    req.flash("notice", "Message marked as unread.")
    res.redirect("/messages/inbox")
  } catch (error) {
    console.error("Error marking message as unread:", error)
    req.flash("notice", "Sorry, there was an error updating the message.")
    res.redirect("/messages/inbox")
  }
}

/* ***************************
 *  Archive message
 * ************************** */
messageController.archiveMessage = async function (req, res, next) {
  try {
    const message_id = parseInt(req.params.messageId)
    const account_id = res.locals.accountData.account_id
    
    await messageModel.archiveMessage(message_id, account_id)
    req.flash("notice", "Message archived successfully.")
    res.redirect("/messages/inbox")
  } catch (error) {
    console.error("Error archiving message:", error)
    req.flash("notice", "Sorry, there was an error archiving the message.")
    res.redirect("/messages/inbox")
  }
}

/* ***************************
 *  Unarchive message
 * ************************** */
messageController.unarchiveMessage = async function (req, res, next) {
  try {
    const message_id = parseInt(req.params.messageId)
    const account_id = res.locals.accountData.account_id
    
    await messageModel.unarchiveMessage(message_id, account_id)
    req.flash("notice", "Message moved to inbox.")
    res.redirect("/messages/archived")
  } catch (error) {
    console.error("Error unarchiving message:", error)
    req.flash("notice", "Sorry, there was an error moving the message.")
    res.redirect("/messages/archived")
  }
}

/* ***************************
 *  Delete message
 * ************************** */
messageController.deleteMessage = async function (req, res, next) {
  try {
    const message_id = parseInt(req.params.messageId)
    const account_id = res.locals.accountData.account_id
    
    const result = await messageModel.deleteMessage(message_id, account_id)
    
    if (result) {
      req.flash("notice", "Message deleted successfully.")
    } else {
      req.flash("notice", "Message could not be deleted.")
    }
    
    res.redirect("/messages/inbox")
  } catch (error) {
    console.error("Error deleting message:", error)
    req.flash("notice", "Sorry, there was an error deleting the message.")
    res.redirect("/messages/inbox")
  }
}

module.exports = messageController