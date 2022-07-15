import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import NavBar from '../../components/NavBar';
import Home from '../Home';

import {getCookie} from '../../utils/cookie';

const App = () => {
    const loginStatus = getCookie("token") ? true : false;

    return (
      <Router>
          <NavBar isLoggedIn={loginStatus}/>
          <Routes>
            <Route exact path="/" element={<Home/>}/>
          </Routes>
      </Router>
    )
};

export default App;