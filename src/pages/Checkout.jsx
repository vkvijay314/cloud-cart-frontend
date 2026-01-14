import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Checkout() {
  const navigate = useNavigate();

  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  /* ==============================
     ADDRESS STATE
  ============================== */
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    line: "",
    city: "",
    pincode: ""
  });

  /* ==============================
     PAYMENT METHOD
  ============================== */
  const [paymentMethod, setPaymentMethod] = useState("COD");

  /* ==============================
     FETCH CART
  ============================== */
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/api/cart");
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

  /* ==============================
     NORMALIZE CART ITEMS
  ============================== */
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

  /* ==============================
     TOTAL AMOUNT
  ============================== */
  const total = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  /* ==============================
     ADDRESS HANDLER
  ============================== */
  const handleChange = (e) => {
    setAddress(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateAddress = () => {
    return (
      address.name &&
      address.phone &&
      address.line &&
      address.city &&
      address.pincode
    );
  };

  /* ==============================
     PLACE COD ORDER
  ============================== */
  const placeCODOrder = async () => {
    if (!validateAddress()) {
      alert("Please fill complete address");
      return;
    }

    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      setPlacing(true);

      await api.post("/api/orders", {
        items: cartItems,
        address,
        paymentMethod: "COD",
        totalAmount: total
      });

      navigate("/orders");
    } catch (err) {
      console.error("COD order error:", err);
      alert(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  /* ==============================
     ONLINE PAYMENT (RAZORPAY)
  ============================== */
  const payWithRazorpay = async () => {
    if (!validateAddress()) {
      alert("Please fill complete address");
      return;
    }

    try {
      setPlacing(true);

      // 1️⃣ create order on backend
      const orderRes = await api.post("/api/checkout/create");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderRes.data.amount * 100,
        currency: "INR",
        order_id: orderRes.data.orderId,
        name: "CloudCart",
        description: "Secure Payment",
        image: "https://razorpay.com/assets/razorpay-glyph.svg",

        handler: async (response) => {
          await api.post("/api/checkout/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            address,
            items: cartItems,
            totalAmount: total
          });

          navigate("/orders");
        }
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error("Razorpay error:", err);
      alert("Payment failed");
    } finally {
      setPlacing(false);
    }
  };

  /* ==============================
     RENDER
  ============================== */
  if (loading) return <h3>Loading checkout...</h3>;
  if (cartItems.length === 0) return <h3>Your cart is empty</h3>;

  return (
    <div style={styles.container}>
      <h2>Checkout</h2>

      <div style={styles.card}>
        <h3>Order Summary</h3>
        {cartItems.map(item => (
          <p key={item.productId}>
            {item.name} × {item.quantity} — ₹ {item.price * item.quantity}
          </p>
        ))}
        <h4>Total: ₹ {total}</h4>
      </div>

      <div style={styles.card}>
        <h3>Delivery Address</h3>
        <input name="name" placeholder="Full Name" value={address.name} onChange={handleChange} />
        <input name="phone" placeholder="Phone Number" value={address.phone} onChange={handleChange} />
        <input name="line" placeholder="Address" value={address.line} onChange={handleChange} />
        <input name="city" placeholder="City" value={address.city} onChange={handleChange} />
        <input name="pincode" placeholder="Pincode" value={address.pincode} onChange={handleChange} />
      </div>

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
        onClick={() => {
          if (placing) return;
          paymentMethod === "COD" ? placeCODOrder() : payWithRazorpay();
        }}
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
