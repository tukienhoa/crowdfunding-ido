import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {getCookie} from '../../utils/cookie';

import './Home.css';

import { ethers } from 'ethers';
import CrowdfundingIDO from '../../artifacts/contracts/CrowdfundingIDO.sol/CrowdfundingIDO.json';
// const cfAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
//Ropsten Address
const cfAddress = "0xD08E4fdb1963894E0fB566b3a97f2Daf4584260c";

const Home = () => {

    const [IDOs, setIDOs] = useState([]);

    useEffect(() => {
        fetchIDOs();
    }, []);

    const fetchIDOs = async () => {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(cfAddress, CrowdfundingIDO.abi, provider)
            try {
                var idosLength = await contract.idosLength();
                idosLength = idosLength.toNumber();
                const IDOsInfo = [];
                for (let i = 0; i < idosLength; i++) {
                    const IDO = await contract.information(i);
                    IDOsInfo.push(IDO);
                }
                setIDOs(IDOsInfo);
            } 
            catch (error) {
                alert("Err: " + error)
            }
        }
    }

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
    }

    const handleProjectClick = (pid) => {
        window.location.href="/projects/" + pid;
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
                {IDOs.map((project, index) => (
                    <div className="home-project-card" onClick={() => handleProjectClick(index)} key={index}>
                        <img src={project.params.bgIPFS} alt="project-bg" className="home-pj-image"/>
                        <img src={project.params.logoIPFS} alt="project-logo" className="home-pj-logo"/>
                        <div className="card-info">
                            <p className="project-name">Project {index}</p>
                            <p className="pj-coin">$TKN</p>
                            <p className="pj-description">project.description</p>
                            <div className="display-row">
                                <p>Base Amount</p>
                                <p>{project.params.baseAmount.toNumber()}</p>
                                {/* <p>{project.goal}</p> */}
                            </div>
                            <div className="display-row">
                                <p>Total Bought</p>
                                <p>{project.params.totalBought.toNumber()}</p>
                                {/* <p>{project.donation ? project.donation : 0}</p> */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
                            
            <br/><br/><br/>
        </div>
    )
};

export default Home;