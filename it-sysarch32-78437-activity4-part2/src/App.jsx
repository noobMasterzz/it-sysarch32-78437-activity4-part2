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
        })
        .catch(error => console.error(error));
    } else {
      // Handle signup
      axios.post('http://localhost:3000/user/signup', { email, password })
        .then(response => {
          // Automatically login after signup
          handleAuth();
        })
        .catch(error => console.error(error));
    }
  };

  const fetchProducts = () => { 
    axios.get('http://localhost:3000/products')
      .then(response => {
        setProducts(response.data.products);
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
        <div>
          <h2>Create Product</h2>
          <input type="text" placeholder="Name" value={productName} onChange={(e) => setProductName(e.target.value)} />
          <input type="number" placeholder="Price" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
          <input type="file" onChange={(e) => setProductImage(e.target.files[0])} />
          <button onClick={createProduct}>Create Product</button>
        </div>
      ) : (
        <div>
          {isLogin ? (
            <div>
              <h1>Login</h1>
              <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button onClick={handleAuth}>Login</button>
              <p>Don't have an account? <button onClick={() => setIsLogin(false)}>Sign up</button></p>
            </div>
          ) : (
            <div>
              <h1>Sign Up</h1>
              <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button onClick={handleAuth}>Sign up</button>
              <p>Already have an account? <button onClick={() => setIsLogin(true)}>Login</button></p>
            </div>
          )}
        </div>
      )}

      {isLoggedIn && (
        <div>
          <h2>Products</h2>
          <table>
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
                  <td><img src={'http://localhost:3000/${product.productImage}'} alt={product.name} style={{ height: '500px', width: '500px' }} /></td>
                  <td>
                    <button onClick={() => deleteProduct(product._id)}>Delete</button>
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
