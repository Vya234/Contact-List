// You MUST run: npm install framer-motion react-hot-toast
import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
  useRef,
} from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

const API_URL = "https://jsonplaceholder.typicode.com/users";
const LOCAL_STORAGE_KEY = "contactsApp.contacts";

// --- Country Code Data ---
const COUNTRY_CODES = [
  { name: "India (IN)", code: "+91" },
  { name: "USA (US)", code: "+1" },
  { name: "UK (GB)", code: "+44" },
  { name: "Australia (AU)", code: "+61" },
  { name: "Canada (CA)", code: "+1" },
  { name: "Germany (DE)", code: "+49" },
  { name: "France (FR)", code: "+33" },
  { name: "Japan (JP)", code: "+81" },
  { name: "China (CN)", code: "+86" },
  { name: "Brazil (BR)", code: "+55" },
  { name: "South Africa (ZA)", code: "+27" },
  { name: "Singapore (SG)", code: "+65" },
  { name: "UAE (AE)", code: "+971" },
  // Add more as needed
];

// --- Helper to parse phone number (FIXED) ---
const parsePhoneNumber = (phoneStr) => {
  if (!phoneStr) return { code: "+91", number: "" };

  // Find the longest matching code
  let bestMatch = null;
  for (const country of COUNTRY_CODES) {
    if (phoneStr.startsWith(country.code)) {
      if (!bestMatch || country.code.length > bestMatch.code.length) {
        bestMatch = country;
      }
    }
  }

  if (bestMatch) {
    const number = phoneStr.substring(bestMatch.code.length).trim();
    return { code: bestMatch.code, number: number };
  }

  // Fallback for un-matched numbers (e.g., "+1 123 456")
  const parts = phoneStr.split(" ");
  if (parts.length > 1 && parts[0].startsWith("+")) {
    return {
      code: parts[0],
      number: parts.slice(1).join(" "),
    };
  }

  // --- NEW FIX ---
  // Default fallback: if no code matches, assume default code and the whole string is the number
  // This will handle formats like "586.493.6943 x140"
  return { code: "+91", number: phoneStr };
};

// --- Theme Context ---
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  // Default to light theme
  const [theme, setTheme] = useState(() => {
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// --- Icon Components (FIXED: Added className prop) ---
const EditIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);
const DeleteIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const CopyIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);
const SunIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);
const MoonIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);
const BuildingIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);
const LocationIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const WebIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
    />
  </svg>
);
const PhoneIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);
const EmailIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);
const MessageIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);
const InfoIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// --- Theme Toggle Component ---
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {theme === "light" ? <SunIcon /> : <MoonIcon />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
};

// --- Contact Form Component ---
const ContactForm = ({
  currentContact,
  onSave,
  onCancel,
  formRef, // Receive the ref
}) => {
  // Separate state for the contact object
  const [contactDetails, setContactDetails] = useState(
    currentContact || {
      name: "",
      email: "",
      address: { street: "", city: "" },
      company: { name: "" },
      website: "",
    }
  );
  // Separate state for phone parts
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [errors, setErrors] = useState({});

  // Parse phone number when contact prop changes
  useEffect(() => {
    if (currentContact) {
      const { code, number } = parsePhoneNumber(currentContact.phone);
      setCountryCode(code);
      setPhoneNumber(number);
      setContactDetails(currentContact);
    } else {
      // Reset for "Add New"
      setCountryCode("+91");
      setPhoneNumber("");
      setContactDetails({
        name: "",
        email: "",
        phone: "+91 ", // This 'phone' is just for the initial object struct
        address: { street: "", city: "" },
        company: { name: "" },
        website: "",
      });
    }
  }, [currentContact]);

  const validate = () => {
    const newErrors = {};
    if (!contactDetails.name) newErrors.name = "Name is required";
    if (!contactDetails.email) newErrors.email = "Email is required";
    if (!phoneNumber) newErrors.phone = "Phone is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Field Handlers ---
  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    if (name === "street" || name === "city") {
      setContactDetails((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else if (name === "companyName") {
      setContactDetails((prev) => ({
        ...prev,
        company: { ...prev.company, name: value },
      }));
    } else {
      setContactDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCountryChange = (e) => {
    setCountryCode(e.target.value);
  };

  // --- Phone Input Change (FIXED) ---
  const handlePhoneChange = (e) => {
    // Allow digits, spaces, -, (, ), ., and x
    const filteredValue = e.target.value.replace(/[^0-9-()\s.x]/g, "");
    setPhoneNumber(filteredValue);
  };
  // --- End Field Handlers ---

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Combine phone parts before saving
      const fullPhoneNumber = `${countryCode} ${phoneNumber}`;
      onSave({
        ...contactDetails,
        phone: fullPhoneNumber,
      });
    }
  };

  return (
    // Attach the ref to the form's motion.div
    <motion.div
      ref={formRef}
      className="contact-form"
      initial={{ opacity: 0, height: 0, y: -20 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <form onSubmit={handleSubmit}>
        <div className="contact-form-grid">
          {/* --- Name --- */}
          <div className="form-input-container">
            <label className="form-label" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Full Name"
              value={contactDetails.name}
              onChange={handleDetailChange}
              className={`form-input ${errors.name ? "input-error" : ""}`}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* --- Email --- */}
          <div className="form-input-container">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email Address"
              value={contactDetails.email}
              onChange={handleDetailChange}
              className={`form-input ${errors.email ? "input-error" : ""}`}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* --- Phone --- */}
          <div className="form-input-container">
            <label className="form-label" htmlFor="phone">
              Phone
            </label>
            <div className="phone-input-group">
              <select
                className="phone-code-select" // <<< FIX: Removed 'form-input' class
                value={countryCode}
                onChange={handleCountryChange}
              >
                {COUNTRY_CODES.map((country) => (
                  <option key={country.name} value={country.code}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
              <input
                type="tel"
                name="phone"
                id="phone"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className={`form-input ${errors.phone ? "input-error" : ""}`}
              />
            </div>
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          {/* --- Company --- */}
          <div className="form-input-container">
            <label className="form-label" htmlFor="companyName">
              Company (Optional)
            </label>
            <input
              type="text"
              name="companyName"
              id="companyName"
              placeholder="Company Name"
              value={contactDetails.company?.name || ""}
              onChange={handleDetailChange}
              className="form-input"
            />
          </div>

          {/* --- Street --- */}
          <div className="form-input-container">
            <label className="form-label" htmlFor="street">
              Street (Optional)
            </label>
            <input
              type="text"
              name="street"
              id="street"
              placeholder="Street Address"
              value={contactDetails.address?.street || ""}
              onChange={handleDetailChange}
              className="form-input"
            />
          </div>

          {/* --- City --- */}
          <div className="form-input-container">
            <label className="form-label" htmlFor="city">
              City (Optional)
            </label>
            <input
              type="text"
              name="city"
              id="city"
              placeholder="City"
              value={contactDetails.address?.city || ""}
              onChange={handleDetailChange}
              className="form-input"
            />
          </div>

          {/* --- Website --- */}
          <div className="contact-form-full form-input-container">
            <label className="form-label" htmlFor="website">
              Website (Optional)
            </label>
            <input
              type="text"
              name="website"
              id="website"
              placeholder="Website"
              value={contactDetails.website || ""}
              onChange={handleDetailChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="contact-form-actions">
          <button type="submit" className="btn btn-save">
            Save
          </button>
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// --- Delete Modal Component ---
const DeleteModal = ({ onConfirm, onCancel }) => (
  <motion.div
    className="modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="modal-content"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
    >
      <h2>Confirm Deletion</h2>
      <p>Are you sure you want to delete this contact?</p>
      <div className="modal-actions">
        <button className="btn btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm}>
          Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// --- Details Modal Component ---
const ContactDetailsModal = ({ contact, onClose }) => {
  if (!contact) return null;

  const { name, email, phone, company, address, website } = contact;
  const fullAddress = [
    address?.street,
    address?.suite,
    address?.city,
    address?.zipcode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} // Close on overlay click
    >
      <motion.div
        className="details-modal-content"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
      >
        <div className="details-modal-header">
          <h2>{name}</h2>
          <button className="btn btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="details-modal-body">
          {/* --- Email --- */}
          <div className="detail-item">
            <EmailIcon />
            <div className="detail-item-content">
              <span>{email || "N/A"}</span>
              <div className="detail-item-actions">
                <a
                  href={`mailto:${email}`}
                  className="btn-action-link"
                  onClick={(e) => e.stopPropagation()} // Allow link click
                >
                  <EmailIcon /> Email
                </a>
              </div>
            </div>
          </div>

          {/* --- Phone --- */}
          <div className="detail-item">
            <PhoneIcon />
            <div className="detail-item-content">
              <span>{phone || "N/A"}</span>
              <div className="detail-item-actions">
                <a
                  href={`tel:${phone}`}
                  className="btn-action-link btn-call"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PhoneIcon /> Call
                </a>
                <a
                  href={`sms:${phone}`}
                  className="btn-action-link btn-message"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageIcon /> Message
                </a>
              </div>
            </div>
          </div>

          {/* --- Company --- */}
          <div className="detail-item">
            <BuildingIcon />
            <div>
              <span>{company?.name || "N/A"}</span>
              {company?.catchPhrase && (
                <div className="detail-item-catchprase">
                  "{company.catchPhrase}"
                </div>
              )}
            </div>
          </div>

          {/* --- Address --- */}
          <div className="detail-item">
            <LocationIcon />
            <span>{fullAddress || "N/A"}</span>
          </div>

          {/* --- Website --- */}
          <div className="detail-item">
            <WebIcon />
            <a
              href={`http://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {website || "N/A"}
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Features Modal Component ---
const FeaturesModal = ({ onClose }) => (
  <motion.div
    className="modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="details-modal-content" // Re-use details modal style
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="details-modal-header">
        <h2>App Features</h2>
        <button className="btn btn-cancel" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="details-modal-body">
        <ul className="features-list">
          <li>
            <strong>Add, Edit, & Delete:</strong> Full contact management.
          </li>
          <li>
            <strong>Debounced Search:</strong> Fast, non-blocking list
            filtering.
          </li>
          <li>
            <strong>Dark Mode:</strong> Switch themes with the toggle in the
            header.
          </li>
          <li>
            <strong>Local Storage:</strong> Your contacts are saved in your
            browser!
          </li>
          <li>
            <strong>Form Validation:</strong> Ensures required fields are
            filled.
          </li>
          <li>
            <strong>Toast Notifications:</strong> Real-time feedback for all
            actions.
          </li>
          <li>
            <strong>Modals:</strong> Clean pop-ups for details, deletion, and
            this one!
          </li>
          <li>
            <strong>Alphabetical Grouping:</strong> Contacts are grouped by
            letter.
          </li>
          <li>
            <strong>Click-to-Copy:</strong> Click any email or phone in the table
            to copy.
          </li>
          <li>
            <strong>Click-to-Action:</strong> Call, message, or email from the
            "View Details" modal.
          </li>
          <li>
            <strong>Country Code Selector:</strong> Added to the phone input.
          </li>
          <li>
            <strong>Skeleton Loader:</strong> A smooth loading state.
          </li>
          <li>
            <strong>Responsive Design:</strong> Works on desktop and mobile.
          </li>
        </ul>
      </div>
    </motion.div>
  </motion.div>
);

// --- Skeleton Component ---
const SkeletonRow = () => (
  <tr>
    <td className="py-2 px-4">
      <div className="avatar-circle skeleton-row">
        <div />
      </div>
    </td>
    <td>
      <div className="h-4 skeleton-row rounded w-3/4">
        <div />
      </div>
    </td>
    <td>
      <div className="h-4 skeleton-row rounded w-5/6">
        <div />
      </div>
    </td>
    <td>
      <div className="h-4 skeleton-row rounded w-1/2">
        <div />
      </div>
    </td>
    <td>
      <div className="h-4 skeleton-row rounded w-1/4">
        <div />
      </div>
    </td>
  </tr>
);

// --- Main App Component ---
function App() {
  const [contacts, setContacts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);
  const [viewingContact, setViewingContact] = useState(null);
  const [showFeatures, setShowFeatures] = useState(false);
  const { theme } = useTheme();

  // Ref for the form to scroll to
  const formRef = useRef(null);

  // --- Data Fetching & Local Storage ---
  useEffect(() => {
    const fetchContacts = async () => {
      // 1. Check local storage first
      const storedContacts = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedContacts) {
        setContacts(JSON.parse(storedContacts));
        setLoading(false);
      } else {
        // 2. If no local data, fetch from API
        try {
          const response = await axios.get(API_URL);
          const sortedContacts = response.data.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setContacts(sortedContacts);
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(sortedContacts)
          );
        } catch (err) {
          toast.error("Failed to fetch contacts");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchContacts();
  }, []);

  // --- Save to Local Storage ---
  useEffect(() => {
    // Don't save during the initial load
    if (!loading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contacts));
    }
  }, [contacts, loading]);

  // --- Debouncing Effect ---
  useEffect(() => {
    const timerId = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    return () => clearTimeout(timerId);
  }, [searchInput]);

  // --- Scrolling Effect (FIXED) ---
  useEffect(() => {
    if (showAddForm && formRef.current) {
      // Add a small delay to ensure the form is rendered and ready
      const timer = setTimeout(() => {
        formRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start", // <<< FIX: Changed to 'start'
        });
      }, 100); // <<< FIX: Increased delay
      return () => clearTimeout(timer);
    }
  }, [showAddForm, editingContact]); // Triggers on Add or Edit

  // --- Contact Handlers ---
  const handleAddClick = () => {
    setEditingContact({
      name: "",
      phone: "+91 ", // Start with default code
      email: "",
      address: { street: "", city: "" },
      company: { name: "" },
      website: "",
    });
    setShowAddForm(true);
  };

  const handleEditClick = (contact) => {
    setEditingContact(contact);
    setShowAddForm(true);
  };

  const handleSaveContact = (contactToSave) => {
    if (contactToSave.id) {
      // --- Update ---
      setContacts((prev) =>
        prev
          .map((c) => (c.id === contactToSave.id ? contactToSave : c))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.success("Contact updated!");
    } else {
      // --- Add New (FIXED) ---
      const newContact = {
        ...contactToSave,
        id: Date.now(), // Simple unique ID
      };
      setContacts((prev) =>
        [...prev, newContact].sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.success("Contact added!");
    }
    setShowAddForm(false);
    setEditingContact(null);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingContact(null);
  };

  const handleDeleteClick = (contact) => {
    setDeletingContact(contact);
  };

  const confirmDelete = () => {
    setContacts((prev) =>
      prev.filter((c) => c.id !== deletingContact.id)
    );
    toast.error("Contact deleted.");
    setDeletingContact(null);
  };

  // --- Search & Grouping ---
  const groupedContacts = useMemo(() => {
    const filtered = contacts.filter((contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.reduce((acc, contact) => {
      // Ensure contact.name exists and is not empty
      if (!contact.name) return acc;
      const firstLetter = contact.name[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(contact);
      return acc;
    }, {});
  }, [contacts, searchTerm]);

  // --- Click-to-Copy ---
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  // --- Avatar Function ---
  const getAvatar = (name) => {
    const firstLetter = name ? name.charAt(0).toUpperCase() : "?";
    const hash = name
      ? name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : 0;
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEEAD",
      "#D4A4EB",
    ];
    const color = colors[hash % colors.length];
    return (
      <div className="avatar-circle" style={{ backgroundColor: color }}>
        {firstLetter}
      </div>
    );
  };

  return (
    <div className="app-container">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === "dark" ? "#333" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
          },
        }}
      />
      <AnimatePresence>
        {deletingContact && (
          <DeleteModal
            onConfirm={confirmDelete}
            onCancel={() => setDeletingContact(null)}
          />
        )}
        {viewingContact && (
          <ContactDetailsModal
            contact={viewingContact}
            onClose={() => setViewingContact(null)}
          />
        )}
        {showFeatures && (
          <FeaturesModal onClose={() => setShowFeatures(false)} />
        )}
      </AnimatePresence>

      <header className="header">
        <div className="header-title">
          <img src="/logo.png" alt="Logo" className="header-logo" />
          <h1>Contact List</h1>
        </div>
        <div className="header-controls">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
          <button
            onClick={handleAddClick}
            className="btn btn-add"
            disabled={showAddForm}
          >
            Add Contact
          </button>
          <ThemeToggle />
          <button
            className="theme-toggle-btn" // Re-use style
            onClick={() => setShowFeatures(true)}
            aria-label="Show app features"
          >
            <InfoIcon />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showAddForm && (
          <ContactForm
            formRef={formRef} // Pass the ref
            currentContact={editingContact}
            onSave={handleSaveContact}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>

      <div className="contact-table-wrapper">
        <table className="contact-table">
          <thead>
            <tr>
              <th style={{ width: "50px" }}></th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : Object.keys(groupedContacts).length > 0 ? (
              Object.keys(groupedContacts).map((letter) => (
                <React.Fragment key={letter}>
                  <tr className="group-header">
                    <td colSpan="5">{letter}</td>
                  </tr>
                  <AnimatePresence>
                    {groupedContacts[letter].map((contact) => (
                      <motion.tr
                        key={contact.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -50 }}
                      >
                        <td>{getAvatar(contact.name)}</td>
                        <td
                          className="clickable-name"
                          onClick={() => setViewingContact(contact)}
                        >
                          {contact.name}
                        </td>
                        <td
                          className="copyable-cell"
                          onClick={() =>
                            handleCopy(contact.email, "Email")
                          }
                        >
                          {contact.email}
                          <CopyIcon className="copy-icon" />
                        </td>
                        <td
                          className="copyable-cell"
                          onClick={() =>
                            handleCopy(contact.phone, "Phone")
                          }
                        >
                          {contact.phone || "N/A"}
                          <CopyIcon className="copy-icon" />
                        </td>
                        <td className="action-buttons">
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => handleEditClick(contact)}
                            aria-label={`Edit ${contact.name}`}
                          >
                            <EditIcon />
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => handleDeleteClick(contact)}
                            aria-label={`Delete ${contact.name}`}
                          >
                            <DeleteIcon />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-state">
                  No contacts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Wrap App in ThemeProvider
const AppWithTheme = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default AppWithTheme;

