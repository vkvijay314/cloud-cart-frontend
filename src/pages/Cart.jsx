import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";

function Cart() {
  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  /* ==============================
     FETCH CART
  ============================== */
  useEffect(() => {
    let mounted = true;

    const fetchCart = async () => {
      try {
        const res = await api.get("/api/cart");
        if (mounted) {
          setRawItems(res.data?.cart?.items || []);
        }
      } catch (err) {
        console.error("Fetch cart error:", err);
        if (mounted) setRawItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCart();
    return () => {
      mounted = false;
    };
  }, []);

  /* ==============================
     NORMALIZE CART DATA
  ============================== */
  const cartItems = useMemo(() => {
    return rawItems
      .filter(item => item?.product?._id && typeof item.quantity === "number")
      .map(item => ({
        productId: item.product._id,
        name: item.product.name,
        price: Number(item.product.price) || 0,
        quantity: Math.max(1, item.quantity)
      }));
  }, [rawItems]);

  /* ==============================
     TOTAL PRICE
  ============================== */
  const total = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  /* ==============================
     REMOVE ITEM
  ============================== */
  const removeFromCart = async (productId) => {
    try {
      setUpdatingId(productId);

      await api.delete("/api/cart/remove", {
        data: { productId }
      });

      setRawItems(prev =>
        prev.filter(item => item?.product?._id !== productId)
      );
    } catch (err) {
      console.error("Remove cart error:", err);
      alert("Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ==============================
     UPDATE QUANTITY
  ============================== */
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingId(productId);

      await api.put("/api/cart/update", {
        productId,
        quantity: newQuantity
      });

      setRawItems(prev =>
        prev.map(item =>
          item?.product?._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (err) {
      console.error("Update quantity error:", err);
      alert("Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ==============================
     CHECKOUT (WITH RAZORPAY ICON)
  ============================== */
  const handleCheckout = async () => {
    try {
      setCheckingOut(true);

      // 1️⃣ Create order on backend
      const res = await api.post("/api/checkout/create");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: res.data.amount * 100,
        currency: "INR",
        order_id: res.data.orderId,

        name: "Cloud Cart",
        description: "Secure Payment",

        // ✅ RAZORPAY ICON (THIS IS WHAT YOU ASKED)
        image: "https://razorpay.com/assets/razorpay-glyph.svg",

        handler: async function (response) {
          // 2️⃣ Verify payment
          await api.post("/api/checkout/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          alert("Payment successful 🎉");
          window.location.reload(); // cart clears after payment
        },

        theme: {
          color: "#2563eb"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return <h3>Loading cart...</h3>;

  return (
    <div className="container">
      <h2>Your Cart</h2>

      {cartItems.length === 0 && <p>Your cart is empty</p>}

      {cartItems.map(item => (
        <div key={item.productId} className="card">
          <p><strong>{item.name}</strong></p>
          <p>₹ {item.price}</p>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              disabled={updatingId === item.productId}
              onClick={() =>
                updateQuantity(item.productId, item.quantity - 1)
              }
            >
              −
            </button>

            <span>{item.quantity}</span>

            <button
              disabled={updatingId === item.productId}
              onClick={() =>
                updateQuantity(item.productId, item.quantity + 1)
              }
            >
              +
            </button>
          </div>

          <button
            disabled={updatingId === item.productId}
            style={{
              marginTop: "10px",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              padding: "6px 10px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
            onClick={() => removeFromCart(item.productId)}
          >
            Remove
          </button>
        </div>
      ))}

      {cartItems.length > 0 && (
        <div className="card">
          <h3>Total: ₹ {total}</h3>

          {/* CHECKOUT BUTTON WITH RAZORPAY BRANDING */}
          <button
            disabled={checkingOut}
            onClick={handleCheckout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            <img
              src="https://razorpay.com/assets/razorpay-glyph.svg"
              alt="Razorpay"
              style={{ width: "18px" }}
            />
            {checkingOut ? "Processing..." : "Pay with Razorpay"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;
