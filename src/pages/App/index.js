import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import NavBar from '../../components/NavBar';
import { getCookie } from '../../utils/cookie';
import Home from '../Home';
import CreateProject from '../CreateProject';

const App = () => {
    return (
      <Router>
          <NavBar/>
          <Routes>
            <Route exact path="/" element={<Home/>}/>
            <Route exact path="/create-project" element={getCookie("account") ? <CreateProject /> : <Navigate replace to="/" />} />
          </Routes>
      </Router>
    )
};

export default App;