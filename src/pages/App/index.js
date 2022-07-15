import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import NavBar from '../../components/NavBar';
import Home from '../Home';

const App = () => {
    return (
      <Router>
          <NavBar/>
          <Routes>
            <Route exact path="/" element={<Home/>}/>
          </Routes>
      </Router>
    )
};

export default App;