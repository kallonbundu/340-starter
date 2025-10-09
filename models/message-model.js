const pool = require("../database/")

/* ***************************
 *  Send a new message
 * ************************** */
async function sendMessage(message_from, message_to, message_subject, message_body) {
  try {
    const sql = `INSERT INTO message (message_from, message_to, message_subject, message_body) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING *`
    const result = await pool.query(sql, [message_from, message_to, message_subject, message_body])
    return result.rows[0]
  } catch (error) {
    console.error("sendMessage error:", error)
    return null
  }
}

/* ***************************
 *  Get inbox messages for a user (non-archived received messages)
 * ************************** */
async function getInboxMessages(account_id) {
  try {
    const sql = `SELECT m.*, 
                 sender.account_firstname || ' ' || sender.account_lastname as sender_name,
                 sender.account_email as sender_email,
                 sender.account_id as sender_id
                 FROM message m
                 INNER JOIN account sender ON m.message_from = sender.account_id
                 WHERE m.message_to = $1 AND m.message_archived = false
                 ORDER BY m.message_created DESC`
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("getInboxMessages error:", error)
    return []
  }
}

/* ***************************
 *  Get archived messages for a user
 * ************************** */
async function getArchivedMessages(account_id) {
  try {
    const sql = `SELECT m.*, 
                 sender.account_firstname || ' ' || sender.account_lastname as sender_name,
                 sender.account_email as sender_email,
                 sender.account_id as sender_id
                 FROM message m
                 INNER JOIN account sender ON m.message_from = sender.account_id
                 WHERE m.message_to = $1 AND m.message_archived = true
                 ORDER BY m.message_created DESC`
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("getArchivedMessages error:", error)
    return []
  }
}

/* ***************************
 *  Get sent messages for a user
 * ************************** */
async function getSentMessages(account_id) {
  try {
    const sql = `SELECT m.*, 
                 recipient.account_firstname || ' ' || recipient.account_lastname as recipient_name,
                 recipient.account_email as recipient_email,
                 recipient.account_id as recipient_id
                 FROM message m
                 INNER JOIN account recipient ON m.message_to = recipient.account_id
                 WHERE m.message_from = $1
                 ORDER BY m.message_created DESC`
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("getSentMessages error:", error)
    return []
  }
}

/* ***************************
 *  Get message by ID with authorization check
 * ************************** */
async function getMessageById(message_id, account_id) {
  try {
    const sql = `SELECT m.*, 
                 sender.account_firstname || ' ' || sender.account_lastname as sender_name,
                 sender.account_email as sender_email,
                 sender.account_id as sender_id,
                 recipient.account_firstname || ' ' || recipient.account_lastname as recipient_name,
                 recipient.account_email as recipient_email,
                 recipient.account_id as recipient_id
                 FROM message m
                 INNER JOIN account sender ON m.message_from = sender.account_id
                 INNER JOIN account recipient ON m.message_to = recipient.account_id
                 WHERE m.message_id = $1 
                 AND (m.message_to = $2 OR m.message_from = $2)`
    const result = await pool.query(sql, [message_id, account_id])
    return result.rows[0]
  } catch (error) {
    console.error("getMessageById error:", error)
    return null
  }
}

/* ***************************
 *  Mark message as read
 * ************************** */
async function markAsRead(message_id, account_id) {
  try {
    const sql = `UPDATE message 
                 SET message_read = true 
                 WHERE message_id = $1 AND message_to = $2
                 RETURNING *`
    const result = await pool.query(sql, [message_id, account_id])
    return result.rows[0]
  } catch (error) {
    console.error("markAsRead error:", error)
    return null
  }
}

/* ***************************
 *  Mark message as unread
 * ************************** */
async function markAsUnread(message_id, account_id) {
  try {
    const sql = `UPDATE message 
                 SET message_read = false 
                 WHERE message_id = $1 AND message_to = $2
                 RETURNING *`
    const result = await pool.query(sql, [message_id, account_id])
    return result.rows[0]
  } catch (error) {
    console.error("markAsUnread error:", error)
    return null
  }
}

/* ***************************
 *  Archive message
 * ************************** */
async function archiveMessage(message_id, account_id) {
  try {
    const sql = `UPDATE message 
                 SET message_archived = true 
                 WHERE message_id = $1 AND message_to = $2
                 RETURNING *`
    const result = await pool.query(sql, [message_id, account_id])
    return result.rows[0]
  } catch (error) {
    console.error("archiveMessage error:", error)
    return null
  }
}

/* ***************************
 *  Unarchive message (move back to inbox)
 * ************************** */
async function unarchiveMessage(message_id, account_id) {
  try {
    const sql = `UPDATE message 
                 SET message_archived = false 
                 WHERE message_id = $1 AND message_to = $2
                 RETURNING *`
    const result = await pool.query(sql, [message_id, account_id])
    return result.rows[0]
  } catch (error) {
    console.error("unarchiveMessage error:", error)
    return null
  }
}

/* ***************************
 *  Delete message
 * ************************** */
async function deleteMessage(message_id, account_id) {
  try {
    const sql = `DELETE FROM message 
                 WHERE message_id = $1 
                 AND (message_to = $2 OR message_from = $2)
                 RETURNING *`
    const result = await pool.query(sql, [message_id, account_id])
    return result.rows[0]
  } catch (error) {
    console.error("deleteMessage error:", error)
    return null
  }
}

/* ***************************
 *  Get unread message count for a user
 * ************************** */
async function getUnreadCount(account_id) {
  try {
    const sql = `SELECT COUNT(*) as count 
                 FROM message 
                 WHERE message_to = $1 
                 AND message_read = false 
                 AND message_archived = false`
    const result = await pool.query(sql, [account_id])
    return parseInt(result.rows[0].count)
  } catch (error) {
    console.error("getUnreadCount error:", error)
    return 0
  }
}

/* ***************************
 *  Get archived message count for a user
 * ************************** */
async function getArchivedCount(account_id) {
  try {
    const sql = `SELECT COUNT(*) as count 
                 FROM message 
                 WHERE message_to = $1 
                 AND message_archived = true`
    const result = await pool.query(sql, [account_id])
    return parseInt(result.rows[0].count)
  } catch (error) {
    console.error("getArchivedCount error:", error)
    return 0
  }
}

/* ***************************
 *  Get all registered users except current user (for recipient selection)
 * ************************** */
async function getAvailableRecipients(current_account_id) {
  try {
    const sql = `SELECT account_id, 
                 account_firstname || ' ' || account.account_lastname as account_name,
                 account_email,
                 account_type
                 FROM account 
                 WHERE account_id != $1
                 ORDER BY account_firstname, account_lastname`
    const result = await pool.query(sql, [current_account_id])
    return result.rows
  } catch (error) {
    console.error("getAvailableRecipients error:", error)
    return []
  }
}

module.exports = {
  sendMessage,
  getInboxMessages,
  getArchivedMessages,
  getSentMessages,
  getMessageById,
  markAsRead,
  markAsUnread,
  archiveMessage,
  unarchiveMessage,
  deleteMessage,
  getUnreadCount,
  getArchivedCount,
  getAvailableRecipients
}