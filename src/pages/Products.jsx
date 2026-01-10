import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  /* FETCH PRODUCTS */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products");
        setProducts(res.data.products || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* UNIQUE CATEGORIES */
  const categories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean);
    return ["All", ...new Set(cats)];
  }, [products]);

  /* FILTERED PRODUCTS */
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  /* ADD TO CART (🔥 FIX) */
  const addToCart = async (productId) => {
    try {
      setAddingId(productId);
      await api.post("/api/cart/add", {
        productId,
        quantity: 1
      });
      navigate("/cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  if (loading) return <h3 style={{ padding: 20 }}>Loading products…</h3>;

  return (
    <div className="container">
      <h2>Products</h2>

      {/* CATEGORY FILTER */}
      <div style={styles.categories}>
        {categories.map(cat => (
          <button
            key={cat}
            style={{
              ...styles.categoryBtn,
              ...(selectedCategory === cat ? styles.active : {})
            }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      <div className="grid">
        {filteredProducts.map(product => (
          <div key={product._id} className="card">
            <img
              src={product.image}
              alt={product.name}
              style={styles.image}
            />

            <h4>{product.name}</h4>
            <p style={styles.desc}>{product.description}</p>

            <div style={styles.footer}>
              <span style={styles.price}>₹ {product.price}</span>
              <button
                style={styles.btn}
                onClick={() => addToCart(product._id)}
                disabled={addingId === product._id}
              >
                {addingId === product._id ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==============================
   STYLES
============================== */
const styles = {
  container: {
    padding: "20px"
  },
  categories: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },
  categoryBtn: {
    padding: "6px 14px",
    borderRadius: "20px",
    border: "1px solid #2563eb",
    background: "#fff",
    color: "#2563eb",
    cursor: "pointer"
  },
  active: {
    background: "#2563eb",
    color: "#fff"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "10px"
  },
  desc: {
    fontSize: "14px",
    color: "#555"
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px"
  },
  price: {
    fontWeight: "700"
  },
  btn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default Products;
