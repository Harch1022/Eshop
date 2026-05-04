const connection = require('./connect'); // Now importing from connect.js

// Function to create the Users table
const createUsersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS Users (
      UserID INT AUTO_INCREMENT PRIMARY KEY,
      Name VARCHAR(100) NOT NULL,
      Email VARCHAR(100) UNIQUE NOT NULL,
      Password VARCHAR(255) NOT NULL,
      Role TINYINT(1) NOT NULL,
      RegistrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  connection.query(query, (err) => {
    if (err) {
      console.error('Error creating Users table:', err);
    } else {
      console.log('Users table created or already exists.');
    }
  });
};

//function of create the product table
const createProductsTable = () => {
    const query = `
      CREATE TABLE IF NOT EXISTS Products (
        ProductID INT AUTO_INCREMENT PRIMARY KEY,
        ProductName VARCHAR(50) DEFAULT NULL,
        ProductStock INT DEFAULT 0,
        ProductDescription VARCHAR(500) DEFAULT NULL,
        ProductPrice INT DEFAULT 0,
        ProductImage LONGBLOB
      );
    `;
  
    connection.query(query, (err) => {
      if (err) {
        console.error('Error creating Products table:', err);
      } else {
        console.log('Products table created or already exists.');
      }
    });
};
  
// Function to create the Orders table
const createOrdersTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS Orders (
        OrderID INT AUTO_INCREMENT PRIMARY KEY,
        UserID INT NOT NULL,
        OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
        );
    `;

    connection.query(query, (err) => {
        if (err) {
        console.error('Error creating Orders table:', err);
        } else {
        console.log('Orders table created or already exists.');
        }
    });
};
  
// Function to create the Order_Items table
const createOrderItemsTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS Order_Items (
        OrderID INT,
        ProductID INT,
        Number INT NOT NULL CHECK (Number > 0),
        Price INT NOT NULL DEFAULT 0,
        PRIMARY KEY (OrderID, ProductID),
        FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
        FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE
        );
    `;

    connection.query(query, (err) => {
        if (err) {
        console.error('Error creating Order_Items table:', err);
        } else {
        console.log('Order_Items table created or already exists.');
        }
    });
};

// Function to create the Category_type table
const createCategoryTypeTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS Category_type (
        TypeID INT AUTO_INCREMENT PRIMARY KEY,
        TypeName VARCHAR(100) NOT NULL UNIQUE
        );
    `;

    connection.query(query, (err) => {
        if (err) {
        console.error('Error creating Category_type table:', err);
        } else {
        console.log('Category_type table created or already exists.');
        }
    });
};

// Function to alter Order_Items table to add Price column if not exists
const alterOrderItemsTable = (callback) => {
  const query = `ALTER TABLE Order_Items ADD COLUMN Price INT NOT NULL DEFAULT 0`;
  connection.query(query, (err) => {
    if (err) {
      if (err.errno === 1060) {
        console.log('Order_Items Price column already exists.');
      } else {
        console.error('Error altering Order_Items table:', err.message);
      }
    } else {
      console.log('Order_Items table altered (Price column added).');
    }
    if (callback) callback();
  });
};

// Function to alter Shipping table to add PaymentMethod column if not exists
const alterShippingTable = (callback) => {
  const query = `ALTER TABLE Shipping ADD COLUMN PaymentMethod VARCHAR(50) DEFAULT 'Credit Card'`;
  connection.query(query, (err) => {
    if (err) {
      if (err.errno === 1060) {
        console.log('Shipping PaymentMethod column already exists.');
      } else {
        console.error('Error altering Shipping table:', err.message);
      }
    } else {
      console.log('Shipping table altered (PaymentMethod column added).');
    }
    if (callback) callback();
  });
};

// Function to seed admin user if not exists
const seedAdminUser = () => {
  const checkQuery = `SELECT UserID FROM Users WHERE Name = 'admin'`;
  connection.query(checkQuery, (err, results) => {
    if (err) {
      console.error('Error checking admin user:', err);
      return;
    }
    if (results.length === 0) {
      const insertQuery = `INSERT INTO Users (Name, Email, Password, Role) VALUES ('admin', 'admin@eshop.com', 'admin123', 1)`;
      connection.query(insertQuery, (err2) => {
        if (err2) {
          console.error('Error seeding admin user:', err2);
        } else {
          console.log('Admin user seeded: admin / admin123');
        }
      });
    } else {
      console.log('Admin user already exists.');
    }
  });
};

// Function to create the Shipping table
const createShippingTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS Shipping (
      ShippingID INT AUTO_INCREMENT PRIMARY KEY,
      OrderID INT NOT NULL,
      RecipientName VARCHAR(100) DEFAULT NULL,
      Phone VARCHAR(30) DEFAULT NULL,
      Address VARCHAR(300) DEFAULT NULL,
      Status TINYINT(1) NOT NULL DEFAULT 0,
      TrackingNumber VARCHAR(100) DEFAULT NULL,
      CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE
    );
  `;
  connection.query(query, (err) => {
    if (err) {
      console.error('Error creating Shipping table:', err);
    } else {
      console.log('Shipping table created or already exists.');
    }
  });
};

// Function to create the Category_item table
const createCategoryItemTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS Category_item (
        ProductID INT,
        TypeID INT,
        PRIMARY KEY (ProductID, TypeID),
        FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
        FOREIGN KEY (TypeID) REFERENCES Category_type(TypeID) ON DELETE CASCADE
        );
    `;

    connection.query(query, (err) => {
        if (err) {
        console.error('Error creating Category_item table:', err);
        } else {
        console.log('Category_item table created or already exists.');
        }
    });
};


// Export functions
module.exports = {
    createUsersTable,
    createProductsTable,
    createOrdersTable,
    createOrderItemsTable,
    alterOrderItemsTable,
    createShippingTable,
    alterShippingTable,
    seedAdminUser,
    createCategoryTypeTable,
    createCategoryItemTable
};