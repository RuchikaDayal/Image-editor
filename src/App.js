import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import ImageEditor from './Components/ImageEditor';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Image Editor</h1>
        </header>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/editor" element={<ImageEditor />} />
          </Routes>
      
      </div>
    </Router>
  );
}

export default App;
