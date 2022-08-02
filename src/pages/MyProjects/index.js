import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

import './MyProjects.css';

import { ethers } from 'ethers';
import CrowdfundingIDO from '../../artifacts/contracts/CrowdfundingIDO.sol/CrowdfundingIDO.json';
import { getCookie } from '../../utils/cookie';
// const cfAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
//Ropsten Address
const cfAddress = "0xD08E4fdb1963894E0fB566b3a97f2Daf4584260c";

const MyProjects = () => {

    const [ownedIDOs, setOwnedIDOs] = useState([]);
    const [participatedIDOs, setParticipatedIDOs] = useState([]);

    const handlePublishProject = () => {
        window.location.href = "/create-project";
    }

    const fetchIDOs = async () => {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(cfAddress, CrowdfundingIDO.abi, provider)
            try {
                var idosLength = await contract.idosLength();
                idosLength = idosLength.toNumber();
                var ownedList = [];
                var participatedList = [];

                for (let i = 0; i < idosLength; i++) {
                    const IDO = await contract.information(i);
                    if (IDO.owner.toLowerCase() === getCookie("account").toLowerCase()) {
                        ownedList.push(IDO);
                    }
                    var boughtAmount = await contract.boughtAmount(i, getCookie("account"));
                    if (boughtAmount.toNumber() > 0) {
                        participatedList.push(IDO);
                    }
                }
                setOwnedIDOs(ownedList);
                setParticipatedIDOs(participatedList);
                console.log(participatedList);
            } 
            catch (error) {
            }
        }
    }

    const checkIDOstatus = (start, end) => {
        var timestampInSeconds = Date.now() / 1000;
        if (timestampInSeconds >= start && timestampInSeconds <= end) {
            return 1;
        }
        if (timestampInSeconds < start) {
            return 0;
        }
        return 2;
    }

    const handleProjectClick = (pid) => {
        window.location.href="/projects/" + pid;
    }

    useEffect(() => {
        fetchIDOs();
    }, []);

    return (
        <div className="my-projects-page">
            <div className="my-pj-section">
                <p className="my-pj-page-title">My Projects</p>
                <Button variant="primary" onClick={handlePublishProject} className="my-pj-publish-btn">Publish Project</Button>
            </div>
            <div className="wrapper">
                {ownedIDOs.map((project, index) => (
                    <div className="home-project-card" onClick={() => handleProjectClick(index)} key={index}>
                        <img src={project.params.bgIPFS} alt="project-bg" className="home-pj-image"/>
                        <img src={project.params.logoIPFS} alt="project-logo" className="home-pj-logo"/>
                        <div className="card-info">
                            <div className='home-pj-name-status'>
                                <p className="project-name">{project.params.name}</p>
                                {checkIDOstatus(project.params.open[0].toNumber(), project.params.open[1].toNumber()) === 0 ? <p className='pj-status-comingsoon'>Coming soon</p>
                                 : (checkIDOstatus(project.params.open[0].toNumber(), project.params.open[1].toNumber()) === 1 ? <p className='pj-status-opening'>Opening</p>
                                  : <p className='pj-status-ended'>Ended</p>)}
                            </div>
                            <div className="display-row">
                                <p>Base Amount</p>
                                <p>{project.params.baseAmount.toNumber()}</p>
                            </div>
                            <div className="display-row">
                                <p>Total Bought</p>
                                <p>{project.params.totalBought.toNumber()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <p className="my-pj-page-title">Participated Projects</p>
            <div className="wrapper">
                {participatedIDOs.map((project, index) => (
                    <div className="home-project-card" onClick={() => handleProjectClick(index)} key={index}>
                        <img src={project.params.bgIPFS} alt="project-bg" className="home-pj-image"/>
                        <img src={project.params.logoIPFS} alt="project-logo" className="home-pj-logo"/>
                        <div className="card-info">
                            <div className='home-pj-name-status'>
                                <p className="project-name">{project.params.name}</p>
                                {checkIDOstatus(project.params.open[0].toNumber(), project.params.open[1].toNumber()) === 0 ? <p className='pj-status-comingsoon'>Coming soon</p>
                                 : (checkIDOstatus(project.params.open[0].toNumber(), project.params.open[1].toNumber()) === 1 ? <p className='pj-status-opening'>Opening</p>
                                  : <p className='pj-status-ended'>Ended</p>)}
                            </div>
                            <div className="display-row">
                                <p>Base Amount</p>
                                <p>{project.params.baseAmount.toNumber()}</p>
                            </div>
                            <div className="display-row">
                                <p>Total Bought</p>
                                <p>{project.params.totalBought.toNumber()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyProjects;