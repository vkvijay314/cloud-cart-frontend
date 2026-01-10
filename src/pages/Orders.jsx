import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ==============================
     FETCH ORDERS
  ============================== */
  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/my");
        if (mounted) {
          setOrders(res.data?.orders || []);
        }
      } catch (err) {
        console.error("Fetch orders error:", err);
        if (mounted) setError("Failed to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      mounted = false;
    };
  }, []);

  /* ==============================
     NORMALIZE ORDERS (SAFE)
  ============================== */
  const safeOrders = useMemo(() => {
    return orders.map((order) => ({
      id: order._id,
      status: order.status || "placed",
      total: order.totalAmount || 0,
      date: order.createdAt
        ? new Date(order.createdAt).toLocaleDateString()
        : "",
      items: (order.items || []).map((item, index) => ({
        key: item.product?._id || index,
        name: item.name || item.product?.name || "Product",
        quantity: item.quantity || 1,
        price: item.price || item.product?.price || 0
      }))
    }));
  }, [orders]);

  if (loading) return <h3 style={styles.center}>Loading orders…</h3>;
  if (error) return <h3 style={styles.center}>{error}</h3>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Your Orders</h2>

      {safeOrders.length === 0 && (
        <p style={styles.center}>No orders placed yet</p>
      )}

      {safeOrders.map((order) => (
        <div key={order.id} style={styles.card}>
          {/* HEADER */}
          <div style={styles.header}>
            <div>
              <p style={styles.orderId}>
                Order ID: <span>{order.id}</span>
              </p>
              <p style={styles.date}>Placed on: {order.date}</p>
            </div>

            <span
              style={{
                ...styles.status,
                ...(order.status === "placed" ? styles.placed : {})
              }}
            >
              {order.status.toUpperCase()}
            </span>
          </div>

          {/* ITEMS */}
          <div style={styles.items}>
            {order.items.map((item) => (
              <div key={item.key} style={styles.itemRow}>
                <span style={styles.itemName}>{item.name}</span>
                <span style={styles.itemQty}>× {item.quantity}</span>
                <span style={styles.itemPrice}>
                  ₹ {item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div style={styles.footer}>
            <span style={styles.totalLabel}>Order Total</span>
            <span style={styles.totalAmount}>₹ {order.total}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==============================
   STYLES
============================== */
const styles = {
  container: {
    maxWidth: "900px",
    margin: "30px auto",
    padding: "0 15px"
  },
  heading: {
    marginBottom: "20px"
  },
  center: {
    textAlign: "center",
    padding: "20px"
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    padding: "16px",
    marginBottom: "20px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
    marginBottom: "10px"
  },
  orderId: {
    fontWeight: "600",
    marginBottom: "4px"
  },
  date: {
    fontSize: "13px",
    color: "#666"
  },
  status: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    background: "#e5e7eb",
    color: "#111"
  },
  placed: {
    background: "#dcfce7",
    color: "#166534"
  },
  items: {
    marginTop: "10px"
  },
  itemRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gap: "10px",
    padding: "8px 0",
    borderBottom: "1px dashed #eee"
  },
  itemName: {
    fontWeight: "500"
  },
  itemQty: {
    color: "#555"
  },
  itemPrice: {
    fontWeight: "600"
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px"
  },
  totalLabel: {
    fontSize: "14px",
    color: "#555"
  },
  totalAmount: {
    fontSize: "18px",
    fontWeight: "700"
  }
};

export default Orders;
