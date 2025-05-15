import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    verified: false,
  });
  const [editId, setEditId] = useState(null); // Track current edit ID
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editId
      ? `http://localhost:5000/api/users/${editId}`
      : 'http://localhost:5000/api/users';

    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await res.json();

    if (res.ok) {
      setMessage(editId ? '✅ User updated successfully!' : '✅ User added successfully!');
      setStatus('success');
      setFormData({ name: '', email: '', verified: false });
      setEditId(null);
      fetchUsers();
    } else {
      setMessage(`❌ Error: ${result.error}`);
      setStatus('error');
    }

    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      verified: user.verified,
    });
    setEditId(user._id); // now it's a plain string
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) return;

    const res = await fetch(`http://localhost:5000/api/users/${id}`, {
      method: 'DELETE',
    });

    const result = await res.json();

    if (res.ok) {
      setMessage('🗑️ User deleted successfully!');
      setStatus('success');
      fetchUsers();
    } else {
      setMessage(`❌ Error: ${result.error}`);
      setStatus('error');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>📘 MongoDB Users</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="user-form">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-field"
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="verified"
              checked={formData.verified}
              onChange={handleChange}
            />
            Verified
          </label>
          <button type="submit" className="submit-btn">
            {editId ? 'Update User' : 'Add User'}
          </button>
        </form>

        {/* Message */}
        {message && <p className={`status-message ${status}`}>{message}</p>}

        {/* Table */}
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.verified ? '✅ Yes' : '❌ No'}</td>
                  <td>
                    <button onClick={() => handleEdit(user)} className="action-btn edit">Edit</button>
                    <button onClick={() => handleDelete(user._id)} className="action-btn delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;