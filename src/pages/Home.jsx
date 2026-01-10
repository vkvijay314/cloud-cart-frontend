import Products from "./Products";

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.title}>☁️🛒 CloudCart
Fast. Secure. Scalable.</h1>
        <p style={styles.subtitle}>
          Discover amazing products at the best prices
        </p>
      </div>

      {/* Products Section */}
      <Products />
    </div>
  );
}

const styles = {
  hero: {
    padding: "40px 20px",
    textAlign: "center",
    background: "linear-gradient(135deg, #2563eb, #1e40af)",
    color: "#fff",
    marginBottom: "30px",
    borderRadius: "8px"
  },
  title: {
    fontSize: "32px",
    marginBottom: "10px"
  },
  subtitle: {
    fontSize: "16px",
    opacity: 0.9
  }
};

export default Home;
