import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

import './MyProjects.css';

import { ethers } from 'ethers';
import CrowdfundingIDO from '../../artifacts/contracts/CrowdfundingIDO.sol/CrowdfundingIDO.json';
// const cfAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
//Ropsten Address
const cfAddress = "0xD08E4fdb1963894E0fB566b3a97f2Daf4584260c";

const MyProjects = () => {

    const handlePublishProject = () => {
        window.location.href = "/create-project";
    }

    return (
        <div className="my-projects-page">
            <div className="my-pj-section">
                <p className="my-pj-page-title">My Projects</p>
                <Button variant="primary" onClick={handlePublishProject} className="my-pj-publish-btn">Publish Project</Button>
            </div>

            <p className="my-pj-page-title">Participated Projects</p>
        </div>
    );
}

export default MyProjects;