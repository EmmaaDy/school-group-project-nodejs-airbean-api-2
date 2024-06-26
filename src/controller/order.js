import db from '../database/database.js';

// Function to place an order for a specified shopping cart.
const placeOrder = async (req, res) => {
  const { customerID, cartID, guestInfo } = req.body;

  let orderCustomerID = customerID;
  let price = 0;

  try {
    // Check shopping cart ID
    if (!cartID) {
      return res.status(400).json({ message: "CartID is required" });
    }
    const cart = await db.cart.findOne({ _id: cartID });

    if (!cart) {
      return res.status(400).json({ message: "CartID is invalid" });
    }

    const allCartProducts = cart.products; 

    // Check if the user has an account or is a guest.
    if (!orderCustomerID && guestInfo) {
      const { email, phone } = guestInfo;
      if (!email || !phone) {
        return res.status(400).json({ message: "Guest email and phone are required" });
      }

      // Create a guest entry if the user is not logged in
      const guestCustomer = await db.customers.insert({
        username: "guest",
        email: guestInfo.email,
        phone: guestInfo.phone,
      });
      orderCustomerID = guestCustomer._id;
    }

    if (orderCustomerID && !guestInfo) {
      const customer = await db.customers.findOne({ _id: orderCustomerID });
      if (!customer) {
        return res.status(400).json({ message: "Customer not found" });
      }
    }

    // Check if customerID or guestInfo is provided
    if (!orderCustomerID) {
      return res.status(400).json({ message: "customerID or valid GuestInfo is required" });
    }

    // Calculate estimated delivery time
    const orderTime = new Date();
    const estimatedDelivery = new Date(orderTime.getTime() + 20 * 60 * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    const newOrder = {
      customerID: orderCustomerID,
      cartID: cartID,
      cartProducts: allCartProducts,
      totalSum: cart.totalSum,
      date: orderTime,
      estimatedDelivery: estimatedDelivery,
    };

    const savedOrder = await db.orders.insert(newOrder);
    
    // Reset the shopping cart after the order is placed
    await db.cart.update({ _id: cartID }, { $set: { products: [], totalSum: 0 } });

    res.json({ message: "Order placed successfully", order: savedOrder });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Function to fetch order history for a specific user
const getOrdersByCustomerId = async (customerId) => {
  try {
    const orders = await db.orders.find({ customerID: customerId });
    return orders;
  } catch (error) {
    console.error("Error fetching orders", error);
    throw error;
  }
}

// Function to fetch order by cart ID
const getOrderByCartId = async (cartId) => {
  try {
    const order = await db.orders.findOne({ cartID: cartId });
    return order;
  } catch (error) {
    console.error("Error fetching order", error);
    throw error;
  }
}

export { placeOrder, getOrdersByCustomerId, getOrderByCartId };
