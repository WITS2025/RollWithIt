import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function List() {
  const location = useLocation();
  const navigate = useNavigate();
  const [passedList, setPassedList] = useState(location.state?.list || { name: "", items: [] });

  const initialItems = (passedList.items || []).map((item) =>
    typeof item === 'string'
      ? { id: Date.now() + Math.random(), text: item, checked: false }
      : item
  );

  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState('');

  const listId = passedList.id || passedList.name.replace(/\s+/g, "_").toLowerCase();

  const handleAddItem = async () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;

    const newListItem = {
      id: Date.now(),
      text: trimmed,
      checked: false,
    };

    setItems([...items, newListItem]);
    setNewItem('');

    try {
      const res = await fetch(`https://e7pg06nqla.execute-api.us-east-1.amazonaws.com/addToPackingList?listId=${listId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newItem: trimmed }),
      });

      if (!res.ok) throw new Error("Server error");

      console.log("Item saved to server:", trimmed);
    } catch (error) {
      console.error("Failed to save item to server:", error);
      alert("Error saving item to server.");
    }
  };

const handleUpdateItem = async (index, newText) => {
  const trimmed = newText.trim();
  if (!trimmed) return;
  if (index < 0 || index >= items.length) return;

  // Update local state immediately
  const updatedItems = [...items];
  updatedItems[index] = { ...updatedItems[index], text: trimmed };
  setItems(updatedItems);

  try {
    const res = await fetch(
      `https://e7pg06nqla.execute-api.us-east-1.amazonaws.com/$default/updatePackingListItem?listId=${listId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index, newItem: trimmed }),
      }
    );

    if (!res.ok) throw new Error("Server error");

    console.log("Item updated on server:", trimmed);
  } catch (error) {
    console.error("Failed to update item on server:", error);
    alert("Error updating item on server.");
  }
};

  const toggleItemCheck = (itemId) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

const handleUpdateListName = async (newName) => {
  const trimmed = newName.trim();
  if (!trimmed) return;

  // Update local state
  setPassedList((prev) => ({ ...prev, name: trimmed }));

  try {
    const res = await fetch(
      `https://e7pg06nqla.execute-api.us-east-1.amazonaws.com/$default/updatePackingList?listId=${listId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName: trimmed }),
      }
    );

    if (!res.ok) throw new Error("Server error");

    console.log("List name updated on server:", trimmed);
  } catch (error) {
    console.error("Failed to update list name on server:", error);
    alert("Error updating list name on server.");
  }
};

return (
  <div className="container py-5" style={{ maxWidth: '700px' }}>
    <div className="d-flex justify-content-center align-items-center mb-4">
      <div className="input-group mb-3 justify-content-center">
        <input
          type="text"
          className="form-control text-center fw-bold"
          style={{ fontSize: "1.5rem", maxWidth: "400px" }}
          value={passedList.name}
          onChange={(e) => setPassedList({ ...passedList, name: e.target.value })}
          onBlur={(e) => handleUpdateListName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.target.blur();
            }
          }}
        />
      </div>
    </div>

    {/* List of Items */}
    <ul className="list-group mb-4">
      {items.length === 0 ? (
        <li className="list-group-item text-muted fst-italic">No items yet.</li>
      ) : (
        items.map((item) => (
          <li
            key={item.id}
            className="list-group-item d-flex align-items-center"
          >
            <input
              type="checkbox"
              className="form-check-input me-3"
              checked={item.checked}
              onChange={() => toggleItemCheck(item.id)}
              id={`item-${item.id}`}
            />
            <input
              type="text"
              value={item.text}
              onChange={(e) =>
                handleUpdateItem(
                  items.findIndex((i) => i.id === item.id),
                  e.target.value
                )
              }
              className={`form-control flex-grow-1 border-0 ${
                item.checked ? "text-decoration-line-through text-muted" : ""
              }`}
              style={{ cursor: 'text' }}
              aria-label={`Edit item ${item.text}`}
            />
          </li>
        ))
      )}
    </ul>
  </div>
);

{/* Add New Item */}
    <div className="input-group">
      <input
        type="text"
        className="form-control"
        placeholder="Add new item"
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
      />
      <button
        className="btn btn-primary"
        onClick={handleAddItem}
        disabled={!newItem.trim()}
      >
        Add
      </button>
    </div>

      {/* Just return home */}
      <div className="mt-4">
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate('/')}
        >
          Return Home
        </button>
      </div>
    </div>
  );
}

export default List;
