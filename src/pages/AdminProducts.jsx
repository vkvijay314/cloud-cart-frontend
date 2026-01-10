import { useEffect, useState } from "react";
import api from "../api/axios";

function AdminProducts() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: ""
  });

  /* ==============================
     HANDLE INPUT CHANGE
  ============================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ==============================
     FETCH PRODUCTS (RUN ONCE)
  ============================== */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data.products || []);
      } catch (err) {
        console.error("Fetch products error:", err);
      }
    };

    fetchProducts();
  }, []);

  /* ==============================
     ADD / UPDATE PRODUCT
  ============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("description", form.description);
      formData.append("category", form.category);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
      } else {
        await api.post("/products", formData);
      }

      resetForm();

      // refresh list
      const res = await api.get("/products");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Save product error:", err);
      alert("Failed to save product");
    }
  };

  /* ==============================
     EDIT PRODUCT
  ============================== */
  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category
    });
    setImageFile(null);
  };

  /* ==============================
     DELETE PRODUCT
  ============================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete product error:", err);
    }
  };

  /* ==============================
     RESET FORM
  ============================== */
  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      description: "",
      category: ""
    });
    setImageFile(null);
    setEditingId(null);
  };

  /* ==============================
     ADMIN GUARD
  ============================== */
  if (!user || user.role !== "admin") {
    return <h3 style={{ padding: "20px" }}>Access Denied</h3>;
  }

  /* ==============================
     UI
  ============================== */
  return (
    <div className="container">
      <h2 style={{ marginBottom: "20px" }}>Admin Product Panel</h2>

      {/* FORM */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <h3>{editingId ? "Update Product" : "Add Product"}</h3>

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />

          {imageFile && (
            <img
              src={URL.createObjectURL(imageFile)}
              alt="preview"
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "10px"
              }}
            />
          )}

          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />

          <button type="submit">
            {editingId ? "Update Product" : "Add Product"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{ marginLeft: "10px", background: "#6b7280" }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* PRODUCT LIST */}
      <h3>All Products</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px"
        }}
      >
        {products.map((p) => (
          <div key={p._id} className="card">
            {p.image && (
              <img
                src={p.image}
                alt={p.name}
                style={{
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "8px"
                }}
              />
            )}

            <h4>{p.name}</h4>
            <p>₹ {p.price}</p>
            <p>{p.category}</p>

            <button onClick={() => handleEdit(p)}>Edit</button>
            <button
              onClick={() => handleDelete(p._id)}
              style={{ marginLeft: "10px", background: "#dc2626" }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminProducts;
