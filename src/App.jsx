import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  ShoppingCart,
  ChevronDown,
  Star,
  Percent,
  Clock,
  User,
  Plus,
  Minus,
  X,
  ArrowRight
} from "lucide-react";
import "./index.css";

const App = () => {
  const [activeTab, setActiveTab] = useState("delivery"); // delivery, dining
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  
  // Interaction States
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeChip, setActiveChip] = useState("Filter");
  const [activeBottomNav, setActiveBottomNav] = useState("Foodzo");
  
  // Checkout/Order State
  const [orderData, setOrderData] = useState({
    customerName: "",
    address: "",
    phone: "",
    email: ""
  });
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");

  // Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"
  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const searchResults = searchQuery.trim().length > 0
    ? allMenuItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authMode === "login") {
      alert("Logged in successfully!");
    } else {
      alert("Signed up successfully!");
    }
    setIsAuthOpen(false);
    setAuthData({ name: "", email: "", password: "", phone: "" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Cart Logic ---
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1, priceValue: parseInt(item.price.replace("₹", "")) }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, amount) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(1, item.quantity + amount);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.priceValue * item.quantity, 0);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsOrdering(true);
    setOrderMessage("");

    const orderPayload = {
      ...orderData,
      items: cart.map((item) => ({
        name: item.name,
        price: item.priceValue,
        quantity: item.quantity,
      })),
      totalAmount: calculateTotal(),
    };

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();
      if (response.ok) {
        setOrderMessage("✅ Order placed successfully!");
        setCart([]);
        setOrderData({ customerName: "", address: "", phone: "", email: "" });
        setTimeout(() => {
          setOrderMessage("");
          setIsCartOpen(false);
        }, 3000);
      } else {
        setOrderMessage("❌ " + (data.message || "Order failed."));
      }
    } catch (error) {
      setOrderMessage("❌ Connection error. Is the backend running?");
    } finally {
      setIsOrdering(false);
    }
  };

  // --- Dummy Data ---
  const categories = [
    { name: "All", img: "/indian_hero_dish.png" },
    { name: "Biryani", img: "/hyderabadi_biryani.png" },
    { name: "North Indian", img: "/chole_bhature.jpg" },
    { name: "Thali", img: "/royal_indian_thali.png" },
    { name: "Dosa", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500" },
    { name: "Rolls", img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500" },
    { name: "Desserts", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500" }
  ];

  const topBrands = [
    {
      id: "r1",
      name: "Arudha Restaurant",
      rating: 4.8,
      deliveryTime: "30-35 mins",
      cuisines: "North Indian, Biryani, Thali",
      location: "Raxaul",
      distance: "2.5 km",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
      offer: "50% OFF up to ₹100",
      promoted: true
    },
    {
      id: "r2",
      name: "Kwality Walls Frozen Dessert",
      rating: 4.5,
      deliveryTime: "20-25 mins",
      cuisines: "Desserts, Ice Cream",
      location: "Sainik Road",
      distance: "1.2 km",
      image: "/kwality_walls.png",
      offer: "₹125 OFF above ₹249"
    },
    {
      id: "r3",
      name: "KFC",
      rating: 4.1,
      deliveryTime: "40-45 mins",
      cuisines: "Burgers, Fast Food, Rolls",
      location: "Main Market",
      distance: "4.0 km",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
      offer: "Flat ₹150 OFF"
    },
    {
      id: "r4",
      name: "Bikanervala",
      rating: 4.3,
      deliveryTime: "35-40 mins",
      cuisines: "Sweets, North Indian, Snacks",
      location: "Station Road",
      distance: "3.1 km",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
      offer: "20% OFF up to ₹50"
    }
  ];

  const allMenuItems = [
    {
      id: "m1",
      name: "Hyderabadi Biryani",
      restaurant: "Arudha Restaurant",
      rating: 4.6,
      votes: 124,
      price: "₹299",
      description: "A fragrant rice dish cooked with tender meat/veg, spices, and saffron.",
      image: "/hyderabadi_biryani.png",
      veg: false,
      category: "Biryani"
    },
    {
      id: "m2",
      name: "Butter Chicken",
      restaurant: "Arudha Restaurant",
      rating: 4.8,
      votes: 89,
      price: "₹349",
      description: "Tender pieces of chicken cooked in a rich, creamy tomato-based gravy.",
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500",
      veg: false,
      category: "North Indian"
    },
    {
      id: "m3",
      name: "Paneer Tikka Special",
      restaurant: "Arudha Restaurant",
      rating: 4.5,
      votes: 210,
      price: "₹249",
      description: "Classic starter made from chunks of paneer marinated in spices and grilled.",
      image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500",
      veg: true,
      category: "North Indian"
    },
    {
      id: "m4",
      name: "Royal Grand Thali",
      restaurant: "Arudha Restaurant",
      rating: 4.9,
      votes: 350,
      price: "₹499",
      description: "Complete meal with curries, breads, rice, and desserts.",
      image: "/royal_indian_thali.png",
      veg: true,
      category: "Thali"
    },
    {
      id: "m5",
      name: "Chole Bhature",
      restaurant: "Bikanervala",
      rating: 4.4,
      votes: 840,
      price: "₹180",
      description: "Spiced chickpea curry served with fried leavened bread.",
      image: "/chole_bhature.jpg",
      veg: true,
      category: "North Indian"
    },
    {
      id: "m6",
      name: "Masala Dosa",
      restaurant: "South Indian Special",
      rating: 4.3,
      votes: 412,
      price: "₹140",
      description: "Crispy crepe filled with spiced potato masala, served with sambar.",
      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500",
      veg: true,
      category: "Dosa"
    }
  ];

  // Derive items based on activeCategory
  const displayedMenuItems = activeCategory === "All" 
    ? allMenuItems 
    : allMenuItems.filter(item => item.category === activeCategory);

  const filterOptions = ["Filter", "Sort By", "Fast Delivery", "New on Foodzo", "Ratings 4.0+", "Pure Veg", "Offers", "Rs. 300-Rs. 600", "Less than Rs. 300"];

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className={`sw-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="sw-header-container">
          <div className="sw-logo-location">
            <div className="sw-logo">Foodzo</div>
            <div className="sw-location">
              <span className="loc-type">Home</span>
              <span className="loc-text">Raxaul, Bihar, India</span>
              <ChevronDown size={18} className="loc-icon" />
            </div>
          </div>
          <div className="sw-nav-actions">
            <div className="nav-item" onClick={() => setIsSearchOpen(true)}>
              <Search size={20} />
              <span>Search</span>
            </div>
            <div className="nav-item">
              <Percent size={20} />
              <span>Offers</span>
            </div>
            <div className="nav-item" onClick={() => { setIsAuthOpen(true); setAuthMode('login'); }}>
              <User size={20} />
              <span>Sign In</span>
            </div>
            <div className="nav-item cart-nav-item" onClick={() => setIsCartOpen(true)}>
              <div className="cart-icon-wrapper">
                <ShoppingCart size={20} />
                {cart.length > 0 && <span className="cart-badge">{cart.reduce((acc, c) => acc + c.quantity, 0)}</span>}
              </div>
              <span>Cart</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="sw-main-content">
        
        {/* Categories / What's on your mind? */}
        <section className="sw-section categories-section">
          <div className="section-header">
            <h2>What's on your mind?</h2>
          </div>
          <div className="categories-scroll">
            {categories.map((cat, idx) => (
              <div 
                className={`cat-card ${activeCategory === cat.name ? 'active' : ''}`} 
                key={idx}
                onClick={() => setActiveCategory(cat.name)}
              >
                <div className="cat-img-wrapper">
                  <img src={cat.img} alt={cat.name} />
                </div>
                <span className="cat-name">{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        {/* Top Brands / Chains */}
        <section className="sw-section brands-section">
          <div className="section-header">
            <h2>Top restaurant chains in Raxaul</h2>
          </div>
          <div className="brands-scroll">
            {topBrands.map((brand) => (
              <div className="brand-card" key={brand.id}>
                <div className="brand-img-wrapper">
                  <img src={brand.image} alt={brand.name} />
                  <div className="brand-offer-overlay">{brand.offer}</div>
                  {brand.promoted && <div className="promoted-tag">Promoted</div>}
                </div>
                <div className="brand-info">
                  <h3 className="brand-name truncate">{brand.name}</h3>
                  <div className="brand-rating-time">
                    <span className="rating"><Star size={14} fill="currentColor" /> {brand.rating}</span>
                    <span className="dot">•</span>
                    <span className="time">{brand.deliveryTime}</span>
                  </div>
                  <p className="brand-cuisines truncate">{brand.cuisines}</p>
                  <p className="brand-location truncate">{brand.location}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        {/* Restaurants Main Listing with Menu Items as "Dishes" */}
        <section className="sw-section restaurants-section">
          <div className="section-header">
            <h2>Restaurants with online food delivery in Raxaul</h2>
          </div>
          
          <div className="filter-chips">
            {filterOptions.map(chip => (
              <button 
                key={chip} 
                className={`chip ${activeChip === chip ? 'active' : ''}`}
                onClick={() => setActiveChip(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Recommended Dishes mimicking restaurant item menus */}
          <h3 className="sub-heading">
            {activeCategory === "All" ? "Recommended Dishes Near You" : `${activeCategory} Dishes`}
          </h3>
          <div className="dishes-grid">
            {displayedMenuItems.length > 0 ? displayedMenuItems.map((item) => (
              <div className="dish-card" key={item.id}>
                <div className="dish-info">
                  <div className="veg-badge">
                    <span className={item.veg ? "veg-icon" : "non-veg-icon"}></span>
                  </div>
                  <h3 className="dish-name">{item.name}</h3>
                  <div className="dish-price">{item.price} <span style={{ fontSize: '12px', fontWeight: 'normal', marginLeft: '6px', color: '#888'}}>({item.restaurant})</span></div>
                  <div className="dish-rating">
                    <Star size={12} fill="currentColor" color="green" />
                    <span>{item.rating}</span>
                    <span className="votes">({item.votes})</span>
                  </div>
                  <p className="dish-desc">{item.description}</p>
                </div>
                
                <div className="dish-image-action">
                  <div className="image-wrapper">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="add-action-wrapper">
                    {cart.find(c => c.id === item.id) ? (
                      <div className="qty-controls">
                        <button onClick={() => updateQuantity(item.id, -1)}><Minus size={16} /></button>
                        <span>{cart.find(c => c.id === item.id).quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}><Plus size={16} /></button>
                      </div>
                    ) : (
                      <button className="add-btn" onClick={() => addToCart(item)}>ADD</button>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <p style={{ color: '#888', marginTop: '20px' }}>No dishes currently available in this category.</p>
            )}
          </div>
        </section>

        {/* Footer info (App Download) */}
        <section className="app-download-section">
          <h2>For better experience, download the Foodzo app now</h2>
          <div className="store-buttons">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="store-badge" />
            <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="store-badge as" />
          </div>
        </section>
      </main>

      {/* Cart Sidebar / Drawer */}
      <div className={`sw-cart-overlay ${isCartOpen ? "open" : ""}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`sw-cart-drawer ${isCartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <div className="close-btn" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </div>
          <h2>Cart</h2>
        </div>

        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-img"></div>
              <h3>Your cart is empty</h3>
              <p>You can go to home page to view more restaurants</p>
              <button className="browse-btn" onClick={() => setIsCartOpen(false)}>SEE RESTAURANTS NEAR YOU</button>
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-name">
                      <span className={item.veg ? "veg-icon mini" : "non-veg-icon mini"}></span>
                      {item.name}
                    </div>
                    <div className="cart-item-controls">
                      <div className="qty-controls mini">
                        <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                      </div>
                    </div>
                    <div className="cart-item-price">
                      ₹{item.priceValue * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bill-details">
                <h3>Bill Details</h3>
                <div className="bill-row">
                  <span>Item Total</span>
                  <span>₹{calculateTotal()}</span>
                </div>
                <div className="bill-row">
                  <span>Delivery Fee</span>
                  <span>₹40</span>
                </div>
                <div className="bill-row">
                  <span>GST and Restaurant Charges</span>
                  <span>₹25</span>
                </div>
                <hr />
                <div className="bill-row total">
                  <span>TO PAY</span>
                  <span>₹{calculateTotal() + 65}</span>
                </div>
              </div>

              <div className="checkout-form">
                <h3>Delivery Details</h3>
                <form onSubmit={handleOrderSubmit}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={orderData.customerName}
                    onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Delivery Address"
                    value={orderData.address}
                    onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={orderData.phone}
                    onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address (Optional)"
                    value={orderData.email}
                    onChange={(e) => setOrderData({ ...orderData, email: e.target.value })}
                  />
                  <button type="submit" className="checkout-btn" disabled={isOrdering}>
                    {isOrdering ? "Placing Order..." : `PAY ₹${calculateTotal() + 65}`}
                  </button>
                </form>
                {orderMessage && (
                  <div className={`order-status ${orderMessage.includes("❌") ? "error" : "success"}`}>
                    {orderMessage}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Auth Sidebar / Drawer */}
      <div className={`sw-cart-overlay ${isAuthOpen ? "open" : ""}`} onClick={() => setIsAuthOpen(false)}></div>
      <div className={`sw-auth-drawer ${isAuthOpen ? "open" : ""}`}>
        <div className="cart-header" style={{ borderBottom: 'none' }}>
          <div className="close-btn" onClick={() => setIsAuthOpen(false)}>
            <X size={24} />
          </div>
        </div>

        <div className="cart-content" style={{ marginTop: '-10px' }}>
          <div className="auth-header-text">
            <div className="auth-header-info">
              <h3>{authMode === "login" ? "Login" : "Sign up"}</h3>
              <p>
                or <span className="auth-toggle-link" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
                  {authMode === "login" ? "create an account" : "login to your account"}
                </span>
              </p>
              <div style={{ marginTop: '18px', width: '30px', borderBottom: '2px solid black' }}></div>
            </div>
            <img src="https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/Image-login_btpq7r" alt="auth-food" width="105" />
          </div>

          <div className="checkout-form auth-form">
            <form onSubmit={handleAuthSubmit}>
              {authMode === "signup" && (
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={authData.name}
                  onChange={(e) => setAuthData({...authData, name: e.target.value})}
                  style={{ borderRadius: '0', borderBottom: 'none' }}
                />
              )}
              {authMode === "signup" && (
                 <input
                   type="tel"
                   placeholder="Phone Number"
                   required
                   value={authData.phone}
                   onChange={(e) => setAuthData({...authData, phone: e.target.value})}
                   style={{ borderRadius: '0', borderBottom: 'none' }}
                 />
              )}
              <input
                type="email"
                placeholder={authMode === "login" ? "Email Address or Phone Number" : "Email Address"}
                required
                value={authData.email}
                onChange={(e) => setAuthData({...authData, email: e.target.value})}
                style={{ borderRadius: '0', borderBottom: 'none' }}
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={authData.password}
                onChange={(e) => setAuthData({...authData, password: e.target.value})}
                style={{ borderRadius: '0' }}
              />
              <button type="submit" className="checkout-btn" style={{ background: 'var(--color-primary)', marginTop: '20px', borderRadius: '0' }}>
                {authMode === "login" ? "LOGIN" : "SUCCESSFULLY SIGN UP"}
              </button>
            </form>
            <p className="auth-terms">
              By clicking on {authMode === "login" ? "Login" : "Sign up"}, I accept the Terms & Conditions & Privacy Policy
            </p>
          </div>
        </div>
      </div>
      
      {/* Search Fullscreen Overlay */}
      <div className={`sw-search-overlay ${isSearchOpen ? "open" : ""}`}>
        <div className="search-overlay-container">
          <div className="search-header">
            <div className="search-back-btn" onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}>
              <ArrowRight size={24} style={{ transform: "rotate(180deg)" }} />
            </div>
            <div className="search-input-wrapper">
              <input 
                type="text" 
                placeholder="Search for restaurants and food" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && <X size={18} className="clear-search" onClick={() => setSearchQuery("")} />}
            </div>
          </div>
          
          <div className="search-content">
            {searchQuery.trim().length === 0 ? (
               <div className="recent-searches">
                 <h3>Popular Cuisines</h3>
                 <div className="popular-cuisines-pills">
                   {["Biryani", "Pizzas", "North Indian", "Thali", "Sweets", "Rolls"].map(c => (
                     <div key={c} className="cuisine-pill" onClick={() => setSearchQuery(c)}>{c}</div>
                   ))}
                 </div>
               </div>
            ) : (
              <div className="search-results">
                {searchResults.length > 0 ? (
                  <div className="dishes-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {searchResults.map((item) => (
                      <div className="dish-card" key={item.id} style={{ boxShadow: 'none', borderBottom: '1px solid #e9e9eb' }}>
                        <div className="dish-info">
                          <div className="veg-badge">
                            <span className={item.veg ? "veg-icon" : "non-veg-icon"}></span>
                          </div>
                          <h3 className="dish-name">{item.name}</h3>
                          <div className="dish-price">{item.price} <span style={{ fontSize: '12px', fontWeight: 'normal', marginLeft: '6px', color: '#888'}}>({item.restaurant})</span></div>
                          <div className="dish-rating">
                            <Star size={12} fill="currentColor" color="green" />
                            <span>{item.rating}</span>
                            <span className="votes">({item.votes})</span>
                          </div>
                          <p className="dish-desc">{item.description}</p>
                        </div>
                        
                        <div className="dish-image-action">
                          <div className="image-wrapper">
                            <img src={item.image} alt={item.name} />
                          </div>
                          <div className="add-action-wrapper">
                            {cart.find(c => c.id === item.id) ? (
                              <div className="qty-controls">
                                <button onClick={() => updateQuantity(item.id, -1)}><Minus size={16} /></button>
                                <span>{cart.find(c => c.id === item.id).quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)}><Plus size={16} /></button>
                              </div>
                            ) : (
                              <button className="add-btn" onClick={() => addToCart(item)}>ADD</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <p>No match found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Swiggy / Zomato style) */}
      <div className="mobile-bottom-nav">
        {[
          { name: "Foodzo", icon: "https://cdn-icons-png.flaticon.com/512/3553/3553811.png" },
          { name: "Mart", icon: "https://cdn-icons-png.flaticon.com/512/3081/3081840.png" },
          { name: "Search", icon: "https://cdn-icons-png.flaticon.com/512/1044/1044984.png" },
          { name: "Account", icon: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png" }
        ].map(nav => (
          <div 
            key={nav.name}
            className={`bottom-nav-item ${activeBottomNav === nav.name ? 'active' : ''}`}
            onClick={() => {
              setActiveBottomNav(nav.name);
              if (nav.name === "Account") {
                setIsAuthOpen(true);
              }
              if (nav.name === "Search") {
                setIsSearchOpen(true);
              }
            }}
          >
            <img src={nav.icon} alt={nav.name} width={24} />
            <span>{nav.name}</span>
          </div>
        ))}
        <div className="bottom-nav-item" onClick={() => setIsCartOpen(true)}>
          <div className="cart-icon-wrapper">
             <img src="https://cdn-icons-png.flaticon.com/512/3514/3514491.png" alt="Cart" width={24} />
             {cart.length > 0 && <span className="cart-badge-btm">{cart.reduce((acc, c) => acc + c.quantity, 0)}</span>}
          </div>
          <span>Cart</span>
        </div>
      </div>
    </div>
  );
};

export default App;
