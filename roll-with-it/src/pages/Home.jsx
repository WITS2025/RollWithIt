import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {
  const location = useLocation();

  const [lists, setLists] = useState([
    { id: 1, name: 'Beach Trip', items: ['Swimsuit', 'Sunscreen', 'Towel'] },
    { id: 2, name: 'Business Trip', items: ['Laptop', 'Notebook', 'Charger'] },
    { id: 3, name: 'Camping Weekend', items: ['Tent', 'Flashlight', 'Snacks'] },
    { id: 4, name: 'City Break', items: ['Camera', 'Walking Shoes'] },
    { id: 5, name: 'Ski Holiday', items: ['Skis', 'Jacket', 'Gloves'] },
  ]);

  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const updatedList = location.state?.updatedList;
    if (updatedList) {
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === updatedList.id ? updatedList : list
        )
      );
    }
  }, [location.state]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    setLists([...lists, { id: Date.now(), name: newName.trim(), items: [] }]);
    setNewName('');
    setAddingNew(false);
  };

  return (
    <div className="container-fluid vh-100 py-5 bg-light">
      <h2 className="text-center" style={{ fontWeight: '700', letterSpacing: '0.15em', color: '#212529', borderBottom: '3px solid #6c757d', display: 'inline-block', paddingBottom: '0.25rem', marginBottom: '2rem' }}>
        Your Packing Lists
      </h2>

      <div className="row gx-4 gy-4 px-4">
        {lists.map((list) => (
          <Link
            key={list.id}
            to={`/list/${list.id}`}
            state={{ list }}
            className="col-6 col-md-3 text-decoration-none text-dark"
          >
            <div className="card h-100 bg-white text-dark rounded border d-flex align-items-center justify-content-center p-3 list-card" style={{ aspectRatio: '4 / 3', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }} aria-label={list.name}>
              <small className="text-center text-truncate w-100 mb-0 fw-semibold" style={{ letterSpacing: '0.05em', fontSize: '1rem' }}>
                {list.name}
              </small>
            </div>
          </Link>
        ))}

        <style>{`
          .list-card:hover {
            box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.1);
            transform: translateY(-4px);
            cursor: pointer;
          }
        `}</style>

        {/* Add new list UI */}
        <div className="col-6 col-md-3 d-flex align-items-center justify-content-center">
          {addingNew ? (
            <div className="card h-100 w-100 p-3 d-flex flex-column align-items-center justify-content-center">
              <input
                type="text"
                className="form-control mb-2"
                placeholder="List name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') setAddingNew(false);
                }}
              />
              <div>
                <button className="btn btn-primary btn-sm me-2" onClick={handleAdd}>
                  Add
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setAddingNew(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-outline-secondary w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ aspectRatio: '4 / 3', fontSize: '2rem' }} onClick={() => setAddingNew(true)} aria-label="Add new list">
              +
              <span style={{ fontSize: '1rem', fontWeight: 500 }}>Add New</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;