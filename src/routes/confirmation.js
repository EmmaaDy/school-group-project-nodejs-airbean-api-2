// Confirmation route to view the placed order
// To give info when order is delivered, we assume it takes 20 min from when the order was made.

import { Router } from "express";
import { getOrderByOrderId } from "../controller/order.js";

const router = Router();

//Sök order genom att ange order-id:
router.get("/:id", async (req, res) => {
  try {
    const orderId = req.params.id; // Säkerställ att orderId är ett nummer och 10 anger att strängen ska tolkas som ett decimaltal (bas 10)
    const order = await getOrderByOrderId(orderId);
    if (order) {
      //Beräkna tid för leverans (20 min)
      const orderDate = new Date(order.date);
      const deliveryDate = new Date(orderDate.getTime() + 20 * 60000); //Räkna om till millisekunder
      // Gör formatet till HH:MM
      const deliveryTime = deliveryDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Returnera order med leveranstid
      res.json({ ...order, deliveryTime });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
});

export default router;
