import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Track whether it's login or signup mode
  const [token, setToken] = useState('');
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track whether user is logged in
  const [signupSuccess, setSignupSuccess] = useState(false); // Track signup success message
  const [loginSuccess, setLoginSuccess] = useState(false); // Track login success message

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  const handleAuth = () => {
    if (isLogin) {
      // Handle login
      axios.post('http://localhost:3000/user/login', { email, password })
        .then(response => {
          setToken(response.data.token);
          setIsLoggedIn(true); // Set user as logged in
          setLoginSuccess(true); // Set login success message
        })
        .catch(error => console.error(error));
    } else {
      // Handle signup
      axios.post('http://localhost:3000/user/signup', { email, password })
        .then(response => {
          // Automatically login after signup
          handleAuth();
          setSignupSuccess(true); // Set signup success message
        })
        .catch(error => console.error(error));
    }
  };

  const fetchProducts = () => { 
    axios.get('http://localhost:3000/products')
      .then(response => {
        setProducts(response.data.products);
        console.log(response.data.products[0].productImage);
      })
      .catch(error => console.error(error));
  };

  const createProduct = () => {
    const formData = new FormData();
    formData.append('name', productName);
    formData.append('price', productPrice);
    formData.append('productImage', productImage);

    axios.post('http://localhost:3000/products', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        console.log(response.data);
        fetchProducts();
      })
      .catch(error => console.error(error));
  };

  const deleteProduct = (productId) => {
    axios.delete(`http://localhost:3000/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then(response => {
        console.log(response.data);
        fetchProducts();
      })
      .catch(error => console.error(error));
  };
 
  return (
    <div className="App">
      {isLoggedIn ? (
        <div className="container">
          <h2 className="title">Create Product</h2>
          <input className="form-group" type="text" placeholder="Name" value={productName} onChange={(e) => setProductName(e.target.value)} />
          <input className="form-group" type="number" placeholder="Price" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
          <input className="form-group" type="file" onChange={(e) => setProductImage(e.target.files[0])} />
          <button className="form-group" onClick={createProduct}>Create Product</button>
        </div>
      ) : (
        <div className="container">
          {isLogin ? (
            <div>
              <h1 className="title">Login</h1>
              <input className="form-group" type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="form-group" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button className="form-group" onClick={handleAuth}>Login</button>
              {loginSuccess && <p className="success-message">Login successful</p>}
              <p className="switch-mode">Don't have an account? <button onClick={() => setIsLogin(false)}>Sign up</button></p>
            </div>
          ) : (
            <div>
              <h1 className="title">Sign Up</h1>
              <input className="form-group" type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="form-group" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button className="form-group" onClick={handleAuth}>Sign up</button>
              {signupSuccess && <p className="success-message">Account created</p>}
              <p className="switch-mode">Already have an account? <button onClick={() => setIsLogin(true)}>Login</button></p>
            </div>
          )}
        </div>
      )}

      {isLoggedIn && (
        <div className="container">
          <h2 className="title">Products</h2>
          <table className="grid">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td><img src={`http://localhost:3000/${product.productImage}`} alt={product.name} className="icons" style={{ height: '500px', width: '500px' }} /></td>
                  <td>
                    <button className="form-group" onClick={() => deleteProduct(product._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
