import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import DownloadPDFButton from '../components/DownloadPDFButton';
import DownloadCSVButton from '../components/DownloadCSVButton';

function List() {
  const { id } = useParams(); // Gets the listId from URL like /list/:id
  const navigate = useNavigate();

  const [listData, setListData] = useState(null);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);

  const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || 'https://h2fqo38sa8.execute-api.us-east-1.amazonaws.com';

  const fetchList = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/getPackingList?listId=${id}`);
      const result = await res.json();

      // If Lambda returned an error format
      if (result.error) {
        console.error("Lambda error:", result.error);
        setListData(null);
      } else {
        console.log('Fetched list:', result);
        // For now, an item is simply a string. So convert it into an object to do cool stuff
        result.items = result.items.map(item => ({
            id: Date.now() + Math.random(),
            text: item,
            checked: false
        }));
        setListData(result); // Already parsed item from JSON.stringify(data.Item)
        setItems(result.items);
      }
    } catch (err) {
      console.error("Failed to fetch list:", err);
      setListData(null);
    } finally {
      setLoading(false);
    }
  };

  const toTitleCase = (str) => {
    return str.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  };

  const handleAddItem = async () => {
    const trimmed = toTitleCase(newItem.trim());
    if (!trimmed) return;

    const newListItem = {
      id: Date.now(),
      text: trimmed,
      checked: false,
    };

    setItems([...items, newListItem]);
    setNewItem('');

    try {
      const res = await fetch(`${BASE_API_URL}/addToPackingList?listId=${id}`, {
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
    const trimmed = toTitleCase(newText.trim());
    if (!trimmed) return;
    if (index < 0 || index >= items.length) return;
  
    // Update local state immediately
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], text: trimmed };
    setItems(updatedItems);
  
    try {
      const res = await fetch(
        `${BASE_API_URL}/updatePackingListItem?listId=${listData.pk}`,
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
    // Future idea: POST request to change `checked` value
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleUpdateListName = async (newName) => {
    const trimmed = toTitleCase(newName.trim());
    if (!trimmed) return;

    // Update local state
    setListData((prev) => ({ ...prev, title: trimmed }));

    try {
        const res = await fetch(
          `${BASE_API_URL}/updatePackingList?listId=${listData.pk}`,
          {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: trimmed }),
          }
        );

        if (!res.ok) throw new Error("Server error");

        console.log("List name updated on server:", trimmed);
    } catch (error) {
        console.error("Failed to update list name on server:", error);
        alert("Error updating list name on server.");
    }
  };

  useEffect(() => {
    fetchList();
  }, [id]);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <h2>Loading list...</h2>
      </div>
    );
  }

  if (!listData) {
    return (
      <div className="container text-center py-5">
        <h2>List not found</h2>
        <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: '700px' }}>
      <div className="d-flex justify-content-center align-items-center mb-4">
        <div className="input-group mb-3 justify-content-center">
          <input
            type="text"
            className="packing-list-title form-control text-center fw-bold"
            style={{ fontSize: "1.5rem", maxWidth: "400px" }}
            value={listData.title}
            onChange={(e) => setListData({ ...listData, title: e.target.value })}
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
  
      <ul className="list-group mb-4">
        {!items.length ? (
          <li className="list-group-item text-muted fst-italic">No items yet.</li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="list-group-item d-flex align-items-center"
              // style={{ backgroundColor: 'white'}}
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
                onChange={(e) => setItems(
                  items.map((i) => i.id === item.id ? { ...i, text: e.target.value } : i)
                )}
                onBlur={(e) => handleUpdateItem(
                    items.findIndex(i => i.id === item.id),
                    e.target.value
                )}
                className={`form-control flex-grow-1 border-0 ${
                  item.checked ? "text-decoration-line-through text-muted" : ""
                }`}
                style={{ cursor: 'text', backgroundColor: 'transparent' }}
                aria-label={`Edit item ${item.text}`}
              />
            </li>
          ))
        )}
      </ul>
  
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          style={{ backgroundColor: "#ffffff22", color: "var(--bs-body-color)" }}
          placeholder="Add new item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
        />
        <button
          className="btn btn-primary"
          style={{
            backgroundColor: 'var(--bs-primary)',
            color: '#fff',
            border: 'none'
          }}
          onClick={handleAddItem}
          disabled={!newItem.trim()}
        >
          Add
        </button>
      </div>

      {/* Download Buttons */}
      <div className="mt-4 d-flex justify-content-center">
        <div className="d-flex">
          <div className="me-2">
            <DownloadPDFButton 
              listData={listData} 
              items={items} 
              disabled={!items || items.length === 0}
            />
          </div>
          <div>
            <DownloadCSVButton 
              listData={listData} 
              items={items}
              disabled={!items || items.length === 0}
            />
          </div>
        </div>
      </div>
          
        {/* Return home */}
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