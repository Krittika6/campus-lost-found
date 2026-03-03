import { useEffect, useState } from "react";
import API from "./api";

function App() {
  const [page, setPage] = useState(1);
  const limit = 6;

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null);

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newStatus, setNewStatus] = useState("lost");
  const [newLocation, setNewLocation] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
const [messageText, setMessageText] = useState("");
const [view, setView] = useState("feed"); 
const [messages, setMessages] = useState([]);
  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  /* ---------------- FETCH ITEMS ---------------- */
  useEffect(() => {
  if (user) {
    API.get(`/items?page=${page}&limit=${limit}`)
      .then(res => {
        setItems(res.data.items);
        setTotalPages(res.data.totalPages);
      })
      .catch(err => console.log(err));
  }
}, [user, page]);

  /* ---------------- DARK MODE ---------------- */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  /* ---------------- AUTH ---------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch {
      alert("Login failed");
    }
  };
console.log("USER OBJECT:", user);
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", {
        name,
        email,
        password,
        department: "General"
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch {
      alert("Registration failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  /* ---------------- POST ITEM ---------------- */
  const handlePostItem = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", newTitle);
      formData.append("description", newDescription);
      formData.append("category", newCategory);
      formData.append("status", newStatus);
      formData.append("location", newLocation);
      if (newImage) formData.append("image", newImage);

      await API.post("/items", formData);

//  Force re-fetch of current page data
const res = await API.get(`/items?page=${page}&limit=${limit}`);

setItems(res.data.items);
setTotalPages(res.data.totalPages);

      setNewTitle("");
      setNewDescription("");
      setNewCategory("");
      setNewStatus("lost");
      setNewLocation("");
      setNewImage(null);
    } catch {
      alert("Failed to post item");
    }
  };
  //send message fnctn
  const handleSendMessage = async () => {
  try {
    const res = await API.post(`/messages/${activeItem}`, {
      message: messageText,
    });

    console.log("SUCCESS:", res.data);

    setMessageText("");
    setActiveItem(null);

    alert("Message sent successfully!");
  } catch (error) {
    console.log("ERROR FULL:", error);
    console.log("ERROR RESPONSE:", error.response);
    alert("Failed to send message");
  }
};
/*fetch messages fnct*/
const fetchMessages = async () => {
  try {
    const res = await API.get("/messages");
    setMessages(res.data);
  } catch (error) {
    console.log(error);
  }
};
/**/
useEffect(() => {
  if (view === "inbox") {
    fetchMessages();
  }
}, [view]);
  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await API.delete(`/items/${id}`);
      setItems(prev => prev.filter(item => item._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  /* ---------------- MARK RETURNED ---------------- */
  const handleMarkReturned = async (id) => {
    try {
      const res = await API.put(`/items/${id}`, { status: "returned" });

      setItems(prev =>
        prev.map(item =>
          item._id === id ? res.data : item
        )
      );
    } catch {
      alert("Update failed");
    }
  };

  /* ================= AUTH SCREEN ================= */
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <form
          onSubmit={isRegister ? handleRegister : handleLogin}
          className="bg-gray-100 dark:bg-gray-900 p-8 rounded-2xl shadow-lg w-80"
        >
          <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">
            {isRegister ? "Register" : "Login"}
          </h2>

          {isRegister && (
            <input
              type="text"
              placeholder="Name"
              className="w-full mb-4 p-2 rounded bg-white dark:bg-gray-800 dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 p-2 rounded bg-white dark:bg-gray-800 dark:text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 p-2 rounded bg-white dark:bg-gray-800 dark:text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded mb-3">
            {isRegister ? "Register" : "Login"}
          </button>

          <p
            className="text-sm text-center cursor-pointer text-blue-500"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </p>
        </form>
      </div>
    );
  }
/* */
if (view === "inbox") {
  return (
    <div className="min-h-screen p-8 bg-white dark:bg-black text-black dark:text-white">

      <button
        onClick={() => setView("feed")}
        className="mb-6 px-4 py-2 bg-gray-500 text-white rounded"
      >
        Back to Feed
      </button>

      <h2 className="text-2xl font-bold mb-6">My Messages</h2>

      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => (
            <div
              key={msg._id}
              className="p-4 bg-gray-100 dark:bg-gray-900 rounded-xl"
            >
              <p className="font-semibold">
                From: {msg.sender?.name}
              </p>

              <p className="text-sm opacity-70 mb-2">
                Item: {msg.item?.title}
              </p>

              <p>{msg.message}</p>

              <p className="text-xs opacity-50 mt-2">
                {new Date(msg.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
  /* ================= MAIN APP ================= */
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Campus Lost & Found</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Report lost items, at ease.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded"
          >
            {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Logout
          </button>
          <button
  onClick={() => setView("inbox")}
  className="px-4 py-2 bg-purple-600 text-white rounded"
>
  Inbox
</button>
        </div>
      </div>

      {/* POST FORM */}
      <form
        onSubmit={handlePostItem}
        className="mb-12 bg-gray-100 dark:bg-gray-900 p-6 rounded-2xl"
      >
        <h2 className="text-xl mb-4">Post New Item</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="p-2 rounded bg-white dark:bg-gray-800"
            required
          />

          <input
            type="text"
            placeholder="Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="p-2 rounded bg-white dark:bg-gray-800"
            required
          />

          <input
            type="text"
            placeholder="Location"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            className="p-2 rounded bg-white dark:bg-gray-800"
            required
          />

          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="p-2 rounded bg-white dark:bg-gray-800"
          >
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </div>

        <textarea
          placeholder="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="w-full mt-4 p-2 rounded bg-white dark:bg-gray-800"
          required
        />

        <input
          type="file"
          onChange={(e) => setNewImage(e.target.files[0])}
          className="mt-4"
        />

        <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
          Post Item
        </button>
      </form>

      {/* ITEMS GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map(item => {
          const isOwner =
            String(item.postedBy?._id || item.postedBy) === String(user.id);

          return (
            <div
              key={item._id}
              className="rounded-2xl p-6 border bg-gray-100 dark:bg-gray-900"
            >
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="mb-4">{item.description}</p>

              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
              )}

              <p><strong>Status:</strong> {item.status}</p>
              <p><strong>Location:</strong> {item.location}</p>

              <p className="text-sm opacity-70 mt-2">
                Posted by: {item.postedBy?.name}
              </p>
              <p className="text-sm opacity-70">
                Email: {item.postedBy?.email}
              </p>

            {!isOwner && (
  <div className="mt-4">
    <button
      onClick={() => setActiveItem(item._id)}
      className="px-3 py-1 bg-blue-600 text-white rounded"
    >
      {item.status === "lost" ? "I found this" : "I lost this"}
    </button>
  </div>
)}

              {isOwner && (
                <div className="flex gap-2 mt-4">
                  {item.status !== "returned" && (
                    <button
                      onClick={() => handleMarkReturned(item._id)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded"
                    >
                      Mark Returned
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>


{/*Modal UI*/}
{activeItem && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-96">
      <h2 className="text-lg mb-4">Send Message</h2>

      <textarea
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800"
        placeholder="Where did you find it?"
      />

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setActiveItem(null)}
          className="px-3 py-1 bg-gray-400 rounded"
        >
          Cancel
        </button>

        <button
          onClick={handleSendMessage}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  </div>
)}
 

      <div className="flex justify-center gap-4 mt-10">
  <button
    disabled={page === 1}
    onClick={() => setPage(prev => prev - 1)}
    className={`px-4 py-2 rounded ${
      page === 1
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gray-300 dark:bg-gray-700"
    }`}
  >
    Previous
  </button>

  <span className="px-4 py-2">
    Page {page} of {totalPages}
  </span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage(prev => prev + 1)}
    className={`px-4 py-2 rounded ${
      page === totalPages
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gray-300 dark:bg-gray-700"
    }`}
  >
    Next
  </button>
</div>
    </div>
  );
}

export default App;