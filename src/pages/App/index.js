import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import NavBar from '../../components/NavBar';
import { getCookie } from '../../utils/cookie';
import Home from '../Home';
import CreateProject from '../CreateProject';
import ProjectDetails from '../ProjectDetails';
import MyProjects from '../MyProjects';
import NotFound from '../NotFound';

const App = () => {
    return (
      <Router>
          <NavBar/>
          <Routes>
            <Route exact path="/" element={<Home/>}/>
            <Route exact path="/create-project" element={getCookie("account") ? <CreateProject /> : <Navigate replace to="/" />} />
            <Route exact path="/projects/:projectId" element={<ProjectDetails />}/>
            <Route exact path="/my-projects" element={getCookie("account") ? <MyProjects /> : <Navigate replace to="/" />}/>
            <Route path="*" element={<NotFound />}/>
          </Routes>
      </Router>
    )
};

export default App;