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
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.id === itemId) {
          return { ...item, quantity: item.quantity + amount };
        }
        return item;
      });
      return updatedCart.filter(item => item.quantity > 0);
    });
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
    { name: "Desserts", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500" },
    { name: "Pizza", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500" },
    { name: "Burger", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500" },
    { name: "Chinese", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500" },
    { name: "Momos", img: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500" },
    { name: "Ice Cream", img: "https://images.unsplash.com/photo-1563805042-7684c8e9e1cb?w=500" },
    { name: "Healthy", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500" },
    { name: "Sandwich", img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500" },
    { name: "Paratha", img: "https://images.unsplash.com/photo-1626082927389-6cd34d28d052?w=500" },
    { name: "Beverages", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500" },
    { name: "Chaats", img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500" }
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
      image: "/butter_chicken.png",
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
      image: "/paneer_tikka_special.png",
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
    },
    {
      id: "m7",
      name: "Lucknowi Awadhi Biryani",
      restaurant: "Nawab's Kitchen",
      rating: 4.7,
      votes: 180,
      price: "₹320",
      description: "Delicately spiced and slow-cooked in dum style with soft mutton pieces.",
      image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=500",
      veg: false,
      category: "Biryani"
    },
    {
      id: "m8",
      name: "Kolkata Chicken Biryani",
      restaurant: "Aminia Special",
      rating: 4.5,
      votes: 320,
      price: "₹280",
      description: "A beautiful blend of mild spices, slow-cooked chicken, and signature soft potato.",
      image: "https://images.unsplash.com/photo-1589302168068-964664d93cb0?w=500",
      veg: false,
      category: "Biryani"
    },
    {
      id: "m9",
      name: "Ambur Mutton Biryani",
      restaurant: "Star Briyani",
      rating: 4.4,
      votes: 150,
      price: "₹350",
      description: "Tangy mutton biryani made with traditional seeraga samba rice from Tamil Nadu.",
      image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500",
      veg: false,
      category: "Biryani"
    },
    {
      id: "m10",
      name: "Thalassery Biryani",
      restaurant: "Malabar Cafe",
      rating: 4.6,
      votes: 95,
      price: "₹310",
      description: "Kerala's famous biryani featuring kaima rice, subtle spices, and roasted cashews.",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
      veg: false,
      category: "Biryani"
    },
    {
      id: "m11",
      name: "Sindhi Biryani",
      restaurant: "Karachi Darbar",
      rating: 4.2,
      votes: 210,
      price: "₹290",
      description: "Spicy and tangy biryani with an abundance of tomatoes, green chillies, and potatoes.",
      image: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=500",
      veg: false,
      category: "Biryani"
    },
    {
      id: "m12",
      name: "Dindigul Biryani",
      restaurant: "Thalappakatti",
      rating: 4.3,
      votes: 140,
      price: "₹300",
      description: "Flavorful and peppery biryani cooked with jeera samba rice and tender meat.",
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500",
      veg: false,
      category: "Biryani"
    },
    {
      id: "m13",
      name: "Veg Dum Biryani",
      restaurant: "Bikanervala",
      rating: 4.4,
      votes: 450,
      price: "₹220",
      description: "Loaded with fresh vegetables, authentic spices, and cooked in traditional dum.",
      image: "https://images.unsplash.com/photo-1505253716362-af13ceccdefc?w=500",
      veg: true,
      category: "Biryani"
    },
    {
      id: "m14",
      name: "Paneer Tikka Biryani",
      restaurant: "Arudha Restaurant",
      rating: 4.7,
      votes: 310,
      price: "₹260",
      description: "A glorious fusion of char-grilled paneer tikka nested in aromatic biryani rice.",
      image: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=500",
      veg: true,
      category: "Biryani"
    },
    {
      id: "m15",
      name: "Egg Biryani",
      restaurant: "Eggcellent",
      rating: 4.1,
      votes: 120,
      price: "₹210",
      description: "Fragrant basmati rice cooked with boiled and shallow fried spicy eggs.",
      image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500",
      veg: false,
      category: "Biryani"
    },
    {
      id: "m16",
      name: "Malabar Prawn Biryani",
      restaurant: "Ocean Delight",
      rating: 4.8,
      votes: 175,
      price: "₹420",
      description: "Exotic coastal biryani packed with fresh prawns and flavorful Kerala spices.",
      image: "/malabar_prawn_biryani.png",
      veg: false,
      category: "Biryani"
    },
    {
      id: "m17",
      name: "Dal Makhani",
      restaurant: "Punjab Grill",
      rating: 4.8,
      votes: 520,
      price: "₹240",
      description: "Rich, creamy slow-cooked black lentils flavored with fresh cream, butter, and mild Indian spices.",
      image: "/dal_makhani.png",
      veg: true,
      category: "North Indian"
    },
    {
      id: "m18",
      name: "Palak Paneer",
      restaurant: "Bikanervala",
      rating: 4.5,
      votes: 310,
      price: "₹260",
      description: "Fresh cottage cheese cubes simmered in a smooth, mildly spiced spinach gravy.",
      image: "/palak_paneer.png",
      veg: true,
      category: "North Indian"
    },
    {
      id: "m19",
      name: "Tandoori Chicken",
      restaurant: "Arudha Restaurant",
      rating: 4.7,
      votes: 680,
      price: "₹350",
      description: "Whole chicken marinated in yogurt and traditional spices, roasted to perfection in a clay oven.",
      image: "/tandoori_chicken.png",
      veg: false,
      category: "North Indian"
    },
    {
      id: "m20",
      name: "Paneer Butter Masala",
      restaurant: "Punjabi Dhaba",
      rating: 4.6,
      votes: 430,
      price: "₹280",
      description: "Soft paneer cubes cooked in a moderately sweet and spicy tomato cream sauce.",
      image: "/paneer_butter_masala.png",
      veg: true,
      category: "North Indian"
    },
    {
      id: "m21",
      name: "Mutton Rogan Josh",
      restaurant: "Nawab's Kitchen",
      rating: 4.9,
      votes: 290,
      price: "₹450",
      description: "Signature Kashmiri curry with tender lamb chunks cooked in an intensely flavorful red gravy.",
      image: "/mutton_rogan_josh.png",
      veg: false,
      category: "North Indian"
    },
    {
      id: "m22",
      name: "Malai Kofta",
      restaurant: "Swaad Classic",
      rating: 4.4,
      votes: 180,
      price: "₹290",
      description: "Deep-fried potato and paneer dumplings served in a rich, creamy, and mildly sweet cashew gravy.",
      image: "/malai_kofta.png",
      veg: true,
      category: "North Indian"
    },
    {
      id: "m23",
      name: "Kadai Chicken",
      restaurant: "Arudha Restaurant",
      rating: 4.5,
      votes: 260,
      price: "₹340",
      description: "Spicy and aromatic chicken dish cooked with bell peppers, onions, and freshly ground kadai masala.",
      image: "/kadai_chicken.png",
      veg: false,
      category: "North Indian"
    },
    {
      id: "m24",
      name: "Navratan Korma",
      restaurant: "Bikanervala",
      rating: 4.3,
      votes: 150,
      price: "₹270",
      description: "A luxurious medley of mixed vegetables, fruits, and nuts in a rich white gravy.",
      image: "/navratan_korma.png",
      veg: true,
      category: "North Indian"
    },
    {
      id: "m25",
      name: "Chicken Tikka Masala",
      restaurant: "Tikka Town",
      rating: 4.8,
      votes: 550,
      price: "₹360",
      description: "Roasted chunks of chicken bathed in a thick, spiced, and creamy tomato-based sauce.",
      image: "/chicken_tikka_masala.png",
      veg: false,
      category: "North Indian"
    },
    {
      id: "m26",
      name: "Aloo Gobi Adraki",
      restaurant: "Dhaba Estd 1986",
      rating: 4.2,
      votes: 120,
      price: "₹190",
      description: "Classic homestyle cauliflower and potato stir-fry generously flavored with julienned ginger.",
      image: "/aloo_gobi.png",
      veg: true,
      category: "North Indian"
    },
    {
      id: "m27",
      name: "Maharashtrian Thali",
      restaurant: "Peshwai Thali",
      rating: 4.8,
      votes: 340,
      price: "₹350",
      description: "Complete meal featuring puran poli, usal, batata bhaji, varan bhaat, koshimbir, sweet shrikhand.",
      image: "/maharashtrian_thali.png",
      veg: true,
      category: "Thali"
    },
    {
      id: "m28",
      name: "Gujarati Thali",
      restaurant: "Rajdhani Thali",
      rating: 4.7,
      votes: 560,
      price: "₹320",
      description: "Authentic complete meal with dhokla, thepla, sweet kadhi, shrikhand, subtle dal, various shaak.",
      image: "/gujarati_thali.png",
      veg: true,
      category: "Thali"
    },
    {
      id: "m29",
      name: "Rajasthani Thali",
      restaurant: "Chokhi Dhani",
      rating: 4.9,
      votes: 890,
      price: "₹450",
      description: "Royal complete meal with dal baati churma, gatte ki sabzi, ker sangri, bajra roti, garlic chutney.",
      image: "/rajasthani_thali.png",
      veg: true,
      category: "Thali"
    },
    {
      id: "m30",
      name: "Punjabi Thali",
      restaurant: "Amritsari Kulcha",
      rating: 4.6,
      votes: 420,
      price: "₹380",
      description: "Hearty complete meal with dal makhani, paneer tikka, sarson ka saag, makki ki roti, lassi.",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500",
      veg: true,
      category: "Thali"
    },
    {
      id: "m31",
      name: "Bengali Thali",
      restaurant: "Oh! Calcutta",
      rating: 4.7,
      votes: 310,
      price: "₹410",
      description: "Complete authentic meal featuring luchi, chholar dal, shukto, macher jhol, mishti doi, roshogolla.",
      image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500",
      veg: false,
      category: "Thali"
    },
    {
      id: "m32",
      name: "South Indian Thali",
      restaurant: "Dakshin",
      rating: 4.8,
      votes: 750,
      price: "₹290",
      description: "Complete authentic meal on a banana leaf with rice, sambar, rasam, poriyal, papadum, payasam.",
      image: "https://images.unsplash.com/photo-1610192104383-e0d08de411d5?w=500",
      veg: true,
      category: "Thali"
    },
    {
      id: "m33",
      name: "Goan Fish Thali",
      restaurant: "Mum's Kitchen",
      rating: 4.5,
      votes: 280,
      price: "₹420",
      description: "Authentic coastal meal with goan fish curry, fried fish, rice, sol kadi, clam sukka.",
      image: "https://images.unsplash.com/photo-1628204680879-114af1dbe9b1?w=500",
      veg: false,
      category: "Thali"
    },
    {
      id: "m34",
      name: "Kathiawadi Thali",
      restaurant: "Gopi Dining",
      rating: 4.4,
      votes: 190,
      price: "₹310",
      description: "Spicy and rustic western indian meal featuring sev tameta nu shaak, ringan no oro, bajri no rotlo.",
      image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500",
      veg: true,
      category: "Thali"
    },
    {
      id: "m35",
      name: "Kashmiri Wazwan Thali",
      restaurant: "Wazwan Cafe",
      rating: 4.8,
      votes: 150,
      price: "₹550",
      description: "Rich meal featuring rogan josh, yakhni, dum aloo, nadru yakhni, modur pulao, flatbread.",
      image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500",
      veg: false,
      category: "Thali"
    },
    {
      id: "m36",
      name: "Pure Jain Thali",
      restaurant: "Rajdhani Thali",
      rating: 4.6,
      votes: 260,
      price: "₹300",
      description: "Vegetarian meal with no onion or garlic, featuring dal, green sabzi, paneer prep, phulka, rice, sweet.",
      image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500",
      veg: true,
      category: "Thali"
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
