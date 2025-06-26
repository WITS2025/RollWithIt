import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function List() {
  const location = useLocation();
  const navigate = useNavigate();

  const passedList = location.state?.list;

  const initialItems = (passedList.items || []).map((item) =>
    typeof item === 'string'
      ? { id: Date.now() + Math.random(), text: item, checked: false }
      : item
  );

  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;

    setItems([
      ...items,
      {
        id: Date.now(),
        text: trimmed,
        checked: false,
      },
    ]);
    setNewItem('');
  };

  const toggleItemCheck = (itemId) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

return (
    <div className="container py-5" style={{ maxWidth: '700px' }}>
        <div className="d-flex justify-content-center align-items-center mb-4">
            <h2 className="fw-bold mb-0 text-center">{passedList.name}</h2>
        </div>

        {/* List of Items */}
        <ul className="list-group mb-4">
            {items.length === 0 ? (
                <li className="list-group-item text-muted fst-italic">
                    No items yet.
                </li>
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
                        <label
                            htmlFor={`item-${item.id}`}
                            className={`mb-0 flex-grow-1 ${
                                item.checked ? 'text-decoration-line-through text-muted' : ''
                            }`}
                            style={{ cursor: 'pointer' }}
                        >
                            {item.text}
                        </label>
                    </li>
                ))
            )}
        </ul>

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
        {/* Save and Return Button */}
        <div className="mt-4">
            <button
                className="btn btn-outline-primary"
                onClick={() => {
                    navigate('/', {
                    state: {
                        updatedList: {
                        ...passedList,
                        items,
                        },
                    },
                });
            }}
        >
            Save and Return Home
        </button>
    </div>
</div>
);
}

export default List;