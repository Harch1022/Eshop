const connection = require('./connect');

const insertShipping = (data, callback) => {
  const { OrderID, RecipientName, Phone, Address } = data;
  if (!OrderID) {
    return callback(new Error("Missing required field: OrderID"), null);
  }
  const query = `
    INSERT INTO Shipping (OrderID, RecipientName, Phone, Address, Status)
    VALUES (?, ?, ?, ?, 0)
  `;
  connection.query(query, [OrderID, RecipientName || null, Phone || null, Address || null], (err, results) => {
    if (err) {
      console.error("Error inserting shipping:", err);
      return callback(err, null);
    }
    callback(null, results.insertId);
  });
};

const getShippingByOrderId = (orderId, callback) => {
  if (!orderId) {
    return callback(new Error("Missing required parameter: orderId"), null);
  }
  const query = "SELECT * FROM Shipping WHERE OrderID = ?";
  connection.query(query, [orderId], (err, results) => {
    if (err) {
      console.error("Error fetching shipping:", err);
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(new Error("Shipping not found"), null);
    }
    callback(null, results[0]);
  });
};

const updateShipping = (orderId, data, callback) => {
  if (!orderId) {
    return callback(new Error("Missing required parameter: orderId"), null);
  }
  let setClauses = [];
  let values = [];
  const allowed = ['Status', 'TrackingNumber', 'RecipientName', 'Phone', 'Address', 'PaymentMethod'];
  for (const field of allowed) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      values.push(data[field]);
    }
  }
  if (setClauses.length === 0) {
    return callback(new Error("No valid fields to update"), null);
  }
  const query = `UPDATE Shipping SET ${setClauses.join(', ')} WHERE OrderID = ?`;
  values.push(orderId);
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error updating shipping:", err);
      return callback(err, null);
    }
    if (results.affectedRows === 0) {
      return callback(new Error("Shipping record not found"), null);
    }
    callback(null, results);
  });
};

module.exports = {
  insertShipping,
  getShippingByOrderId,
  updateShipping,
};
