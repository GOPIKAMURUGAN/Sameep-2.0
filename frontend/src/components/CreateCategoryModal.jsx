import { useState, useEffect } from "react";

function CreateCategoryModal({
  show,
  onClose,
  parentId = null,
  initialData = null,
  onCreated,
}) {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [price, setPrice] = useState("");
  const [terms, setTerms] = useState("");
  const [visibleToUser, setVisibleToUser] = useState(false);
  const [visibleToVendor, setVisibleToVendor] = useState(false);
  const [sequence, setSequence] = useState(0);
  const [freeText, setFreeText] = useState("");
  const [enableFreeText, setEnableFreeText] = useState(false);
  const [categoryType, setCategoryType] = useState("Products");
  const [availableForCart, setAvailableForCart] = useState(false);
  const [seoKeywords, setSeoKeywords] = useState("");
  const [postRequestsDeals, setPostRequestsDeals] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(false);
  const [linkAttributesPricing, setLinkAttributesPricing] = useState(false);
  const [freeTexts, setFreeTexts] = useState(Array(10).fill(""));
  const [icon, setIcon] = useState(null);


  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setImage(null);
      setPrice(initialData.price ?? "");
      setTerms(initialData.terms ?? "");
      setVisibleToUser(initialData.visibleToUser || false);
      setVisibleToVendor(initialData.visibleToVendor || false);
      setSequence(initialData.sequence ?? 0);
      setFreeText(initialData.freeText || "");
      setEnableFreeText(initialData.freeText ? true : false);
      setCategoryType(initialData.categoryType || "Products");
      setAvailableForCart(initialData.availableForCart || false);
      setSeoKeywords(initialData.seoKeywords || "");

    } else {
      setName("");
      setImage(null);
      setPrice(parentId ? "" : "");
      setTerms("");
      setVisibleToUser(false);
      setVisibleToVendor(false);
      setSequence(0);
      setFreeText(parentId ? "" : "");
      setEnableFreeText(false);
      setCategoryType("Products");
      setAvailableForCart(false);
      setSeoKeywords("");
    }
  }, [initialData, show, parentId]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || (!image && !initialData)) {
      alert("Please fill required fields!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image);
      if (parentId) formData.append("parentId", parentId);
      formData.append("price", price === "" ? "" : price);
      formData.append("sequence", sequence);
      formData.append("terms", terms);
      formData.append("visibleToUser", visibleToUser);
      formData.append("visibleToVendor", visibleToVendor);
      formData.append("freeText", enableFreeText ? freeText : "");
      formData.append("categoryType", categoryType);
      formData.append(
        "availableForCart",
        !parentId ? availableForCart : false
      );
      formData.append("seoKeywords", parentId ? "" : seoKeywords);
      formData.append("postRequestsDeals", postRequestsDeals);
      formData.append("loyaltyPoints", loyaltyPoints);
      formData.append("linkAttributesPricing", linkAttributesPricing);
      freeTexts.forEach((txt, index) => {
        formData.append(`freeText${index + 1}`, txt || "");
      });
      if (icon) formData.append("icon", icon);


      let url = "http://localhost:5000/api/categories";
      let method = "POST";
      if (initialData && initialData._id) {
        url += `/${initialData._id}`;
        method = "PUT";
      }

      const res = await fetch(url, { method, body: formData });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save category");
      }

      setName("");
      setImage(null);
      setPrice("");
      setTerms("");
      setVisibleToUser(false);
      setVisibleToVendor(false);
      setSequence(0);
      setFreeText("");
      setCategoryType("Products");
      setAvailableForCart(false);
      setSeoKeywords("");

      onCreated?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 80%, #f0f8ff)",
          color: "#333",
          padding: "35px 30px",
          borderRadius: "20px",
          width: "450px",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
          transition: "all 0.3s ease-in-out",
          animation: "zoomIn 0.3s ease",
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            textAlign: "center",
            color: "#0078d7",
            fontSize: "1.6rem",
          }}
        >
          {initialData
            ? "✏️ Edit Category"
            : parentId
            ? "📁 Create Subcategory"
            : "🗂️ Create Category"}
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* ✅ Sequence input only for subcategories */}
{parentId && (
  
  <>
    {/* 🧾 Sequence Number */}
    <h4
      style={{
        fontWeight: "600",
        color: "#0078d7",
        marginBottom: "6px",
      }}
    >
      Sequence Number
    </h4>
    <input
      type="number"
      placeholder="Enter Sequence (Order)"
      value={sequence}
      onChange={(e) =>
        setSequence(e.target.value === "" ? 0 : Number(e.target.value))
      }
      style={inputStyle}
    />
  </>
)}


          <input
  type="text"
  placeholder={parentId ? "Enter Subcategory Name" : "Enter Category Name"}
  value={name}
  onChange={(e) => setName(e.target.value)}
  style={{ ...inputStyle, fontWeight: "600", color: "#0078d7" }}
/>


          {/* Upload Category Image */}
<h4 style={{ fontWeight: "600", color: "#0078d7", marginBottom: "8px" }}>
  Upload Category Image
</h4>
{/* Existing image preview (from backend) */}
{initialData?.image && !image && (
  <div style={{ marginBottom: "10px", textAlign: "center" }}>
    <img
      src={initialData.image}
      alt="Current"
      style={{
        width: "120px",
        height: "120px",
        objectFit: "cover",
        borderRadius: "10px",
        border: "2px solid #0078d7",
      }}
    />
    <p style={{ fontSize: "0.85rem", color: "#555" }}>Current Image</p>
  </div>
)}

<input
  type="file"
  accept="image/*"
  onChange={(e) => setImage(e.target.files[0])}
  style={inputStyle}
/>

{image && (
  <div style={{ marginBottom: "10px", textAlign: "center" }}>
    <img
      src={URL.createObjectURL(image)}
      alt="New"
      style={{
        width: "120px",
        height: "120px",
        objectFit: "cover",
        borderRadius: "10px",
        border: "2px solid #28a745",
      }}
    />
    <p style={{ fontSize: "0.85rem", color: "#28a745" }}>New Image Selected</p>
  </div>
)}

{/* Upload Category Icon */}
<h4 style={{ fontWeight: "600", color: "#0078d7", marginBottom: "8px", marginTop: "15px" }}>
  Upload Category Icon
</h4>
<input
  type="file"
  accept="image/*"
  onChange={(e) => setIcon(e.target.files[0])}
  style={inputStyle}
/>

{icon && (
  <div style={{ marginBottom: "10px", textAlign: "center" }}>
    <img
      src={URL.createObjectURL(icon)}
      alt="New Icon"
      style={{
        width: "80px",
        height: "80px",
        objectFit: "cover",
        borderRadius: "10px",
        border: "2px solid #28a745",
      }}
    />
    <p style={{ fontSize: "0.85rem", color: "#28a745" }}>New Icon Selected</p>
  </div>
)}


          {!parentId && (
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              {["Products", "Services", "Products & Services"].map((type) => (
                <label key={type} style={{ color: "#444" }}>
                  <input
                    type="radio"
                    value={type}
                    checked={categoryType === type}
                    onChange={(e) => setCategoryType(e.target.value)}
                    style={{ marginRight: "5px" }}
                  />
                  {type}
                </label>
              ))}
            </div>
          )}

          
            <input
              type="text"
              placeholder="Enter SEO Keywords (comma-separated)"
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
              style={inputStyle}
            />
          

          {/* Subcategory Price */}
          {parentId && (
            <input
              type="number"
              placeholder="Price (Optional)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={inputStyle}
            />
          )}

          

          {parentId && (
  <textarea
    placeholder="Terms & Conditions"
    value={terms}
    onChange={(e) => setTerms(e.target.value)}
    style={textareaStyle}
  />
)}
{/* ✅ Show 10 Free Text inputs only for top-level categories */}
{!parentId && (
  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    {freeTexts.map((txt, i) => (
      <input
        key={i}
        type="text"
        placeholder={`Free Text ${i + 1}`}
        value={txt}
        onChange={(e) => {
          const newTexts = [...freeTexts];
          newTexts[i] = e.target.value;
          setFreeTexts(newTexts);
        }}
        style={inputStyle}
      />
    ))}
  </div>
)}
{parentId && (
  <input
      type="text"
      placeholder="Enter Info Text"
      value={freeText}
      onChange={(e) => setFreeText(e.target.value)}
      style={inputStyle}
    />
)}


                
              {/* ✅ Only top-level categories */}
          {!parentId && (
            <>
              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={enableFreeText}
                  onChange={(e) => setEnableFreeText(e.target.checked)}
                />
                Enable Full Free Text / Discount
              </label>

              {enableFreeText && (
                <textarea
                  placeholder="Enter notes, discount, or info..."
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  style={textareaStyle}
                />
              )}

              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={availableForCart}
                  onChange={(e) => setAvailableForCart(e.target.checked)}
                />
                Available for Cart
              </label>
            </>
          )}


          {!parentId && (
            <>
              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={postRequestsDeals}
                  onChange={(e) => setPostRequestsDeals(e.target.checked)}
                />
                Post Requests & Get Deals
              </label>

              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={loyaltyPoints}
                  onChange={(e) => setLoyaltyPoints(e.target.checked)}
                />
                Loyalty Points Applicable
              </label>

              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={linkAttributesPricing}
                  onChange={(e) => setLinkAttributesPricing(e.target.checked)}
                />
                Link Attributes for Pricing
              </label>

              
            </>
          )}

          <label style={checkboxLabel}>
            <input
              type="checkbox"
              checked={visibleToUser}
              onChange={(e) => setVisibleToUser(e.target.checked)}
            />
            Visible to User
          </label>
          <label style={checkboxLabel}>
            <input
              type="checkbox"
              checked={visibleToVendor}
              onChange={(e) => setVisibleToVendor(e.target.checked)}
            />
            Visible to Vendor
          </label>

          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                background: "#d9534f",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.background = "#c9302c")}
              onMouseOut={(e) => (e.target.style.background = "#d9534f")}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                background: "#0078d7",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.background = "#005fa3")}
              onMouseOut={(e) => (e.target.style.background = "#0078d7")}
            >
              {initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "10px",
  width: "100%",
  borderRadius: "10px",
  border: "1px solid #ccc",
  background: "#fff",
  color: "#333",
  outline: "none",
  fontSize: "0.95rem",
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: "70px",
  resize: "vertical",
};

const checkboxLabel = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  color: "#444",
  fontSize: "0.9rem",
};

export default CreateCategoryModal;
