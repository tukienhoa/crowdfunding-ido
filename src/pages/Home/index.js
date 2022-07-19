import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {getCookie} from '../../utils/cookie';

import './Home.css';

import { ethers } from 'ethers';
import CrowdfundingIDO from '../../artifacts/contracts/CrowdfundingIDO.sol/CrowdfundingIDO.json';
const cfAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const Home = () => {

    const handleCreateProject = () => {
        if (getCookie("account")) {
            // Navigate to create project page
            window.location.href = "/create-project";
        }
        else {
            toast.error('Please access your wallet first!', {
                position: "top-center",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }

        // Call contract

        // if (typeof window.ethereum !== 'undefined') {
        //     const provider = new ethers.providers.Web3Provider(window.ethereum)
        //     const contract = new ethers.Contract(cfAddress, CrowdfundingIDO.abi, provider)
        //     try {
        //       const data = await contract.idosLength()
        //       alert(data);
        //     } 
        //     catch (err) {
        //       console.log("Error: ", err)
        //     }
        // }
    }

    const handleProjectClick = (pid) => {
        // window.location.href="/projects/" + pid;
    }

    return (
        <div>
            <div className="home-banner">
                <div className="home-banner-content">
                    <div>
                        <p className="home-banner-title">Get early access to the ideas of tomorrow</p>
                        <p className="home-title-description">
                            Highly-vetted ideas and teams you can trust. Supported by industry-leading creators and funds.
                        </p>
                        <Button variant="primary" onClick={handleCreateProject}>Create Your Project</Button>
                        <ToastContainer />
                    </div>
                    <img src={require("../../assets/images/home-moving-image.png")} className="moving-image home-mv-img" alt="moving-pic"/>
                </div>
            </div>
            <p className="cf-pj-text">Crowdfunding Projects</p>

            <div className="wrapper">
                {/* {projectList.map((project, index) => (
                    <div className="home-project-card" onClick={() => handleProjectClick(project.project_id)} key={index}>
                        <img src={`data:image/jpeg;base64,${project.backgroundImage}`} alt="project-bg" className="home-pj-image"/>
                        <img src={`data:image/jpeg;base64,${project.logo}`} alt="project-logo" className="home-pj-logo"/>
                        <div className="card-info">
                            <p className="project-name">{project.name}</p>
                            <p className="pj-coin">$MC</p>
                            <p className="pj-description">{project.description}</p>
                            <div className="display-row">
                                <p>Goal</p>
                                <p>{project.goal}</p>
                            </div>
                            <div className="display-row">
                                <p>Total Raised</p>
                                <p>{project.donation ? project.donation : 0}</p>
                            </div>
                        </div>
                    </div>
                ))} */}
                <div className="home-project-card" onClick={() => handleProjectClick(0)}>
                        <img src={`https://picsum.photos/1024/1024?nocache=${0}`} alt="project-bg" className="home-pj-image"/>
                        <img src={`https://picsum.photos/1024/1024?nocache=${0 + 10000}`} alt="project-logo" className="home-pj-logo"/>
                        <div className="card-info">
                            <p className="project-name">Project name</p>
                            <p className="pj-coin">$PTK</p>
                            <p className="pj-description">Description</p>
                            <div className="display-row">
                                <p>Goal</p>
                                <p>999</p>
                            </div>
                            <div className="display-row">
                                <p>Total Raised</p>
                                <p>0</p>
                                {/* <p>{project.donation ? project.donation : 0}</p> */}
                            </div>
                        </div>
                </div>
            </div>
                            
            <br/><br/><br/>
        </div>
    )
};

export default Home;