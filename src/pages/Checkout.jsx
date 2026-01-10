import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Checkout() {
  const navigate = useNavigate();

  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  /* ADDRESS */
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    line: "",
    city: "",
    pincode: ""
  });

  /* PAYMENT METHOD */
  const [paymentMethod, setPaymentMethod] = useState("COD");

  /* FETCH CART */
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/cart");
        setRawItems(res.data?.cart?.items || []);
      } catch (err) {
        console.error("Checkout cart error:", err);
        setRawItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  /* NORMALIZED CART ITEMS */
  const cartItems = useMemo(() => {
    return rawItems
      .filter(item => item?.product && item.quantity > 0)
      .map(item => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));
  }, [rawItems]);

  /* TOTAL */
  const total = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  /* ADDRESS HANDLER */
  const handleChange = (e) => {
    setAddress(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  /* PLACE ORDER (COD) */
  const placeOrder = async () => {
    if (
      !address.name ||
      !address.phone ||
      !address.line ||
      !address.city ||
      !address.pincode
    ) {
      alert("Please fill complete address");
      return;
    }

    try {
      setPlacing(true);
      await api.post("/orders", {
        address,
        paymentMethod: "COD"
      });
      alert("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  /* PAY WITH RAZORPAY (ONLINE) */
  const payWithRazorpay = async () => {
    if (
      !address.name ||
      !address.phone ||
      !address.line ||
      !address.city ||
      !address.pincode
    ) {
      alert("Please fill complete address");
      return;
    }

    try {
      setPlacing(true);

      // Create Razorpay order (backend)
      const orderRes = await api.post("/payment/create", {
        amount: total
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "CloudCart",
        description: "Order Payment",
        order_id: orderRes.data.id,

        handler: async (response) => {
          const verifyRes = await api.post(
            "/payment/verify",
            response
          );

          if (verifyRes.data.success) {
            await api.post("/orders", {
              address,
              paymentMethod: "ONLINE"
            });

            alert("Payment successful, order placed!");
            navigate("/orders");
          } else {
            alert("Payment verification failed");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      alert("Payment failed");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <h3>Loading checkout...</h3>;
  if (cartItems.length === 0) return <h3>Your cart is empty</h3>;

  return (
    <div style={styles.container}>
      <h2>Checkout</h2>

      {/* ORDER SUMMARY */}
      <div style={styles.card}>
        <h3>Order Summary</h3>
        {cartItems.map(item => (
          <p key={item.productId}>
            {item.name} × {item.quantity} — ₹{" "}
            {item.price * item.quantity}
          </p>
        ))}
        <h4>Total: ₹ {total}</h4>
      </div>

      {/* ADDRESS */}
      <div style={styles.card}>
        <h3>Delivery Address</h3>

        <input
          name="name"
          placeholder="Full Name"
          value={address.name}
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Phone Number"
          value={address.phone}
          onChange={handleChange}
        />

        <input
          name="line"
          placeholder="Address"
          value={address.line}
          onChange={handleChange}
        />

        <input
          name="city"
          placeholder="City"
          value={address.city}
          onChange={handleChange}
        />

        <input
          name="pincode"
          placeholder="Pincode"
          value={address.pincode}
          onChange={handleChange}
        />
      </div>

      {/* PAYMENT METHOD */}
      <div style={styles.card}>
        <h3>Payment Method</h3>

        <label>
          <input
            type="radio"
            value="COD"
            checked={paymentMethod === "COD"}
            onChange={e => setPaymentMethod(e.target.value)}
          />
          Cash on Delivery
        </label>

        <br />

        <label>
          <input
            type="radio"
            value="ONLINE"
            checked={paymentMethod === "ONLINE"}
            onChange={e => setPaymentMethod(e.target.value)}
          />
          Online (Razorpay)
        </label>
      </div>

      <button
        style={styles.btn}
        disabled={placing}
        onClick={() =>
          paymentMethod === "COD"
            ? placeOrder()
            : payWithRazorpay()
        }
      >
        {placing
          ? "Processing..."
          : paymentMethod === "COD"
          ? "Place Order"
          : "Pay Now"}
      </button>
    </div>
  );
}

/* STYLES */
const styles = {
  container: {
    maxWidth: "600px",
    margin: "30px auto"
  },
  card: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer"
  }
};

export default Checkout;
