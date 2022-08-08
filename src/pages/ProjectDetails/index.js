import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from "react-router-dom";
import { Form, Button } from 'react-bootstrap';

import './ProjectDetails.css';
import { getCookie } from '../../utils/cookie';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Progressbar from '../../components/ProgressBar';

import { ethers } from 'ethers';
import CrowdfundingIDO from '../../artifacts/contracts/CrowdfundingIDO.sol/CrowdfundingIDO.json';
// const cfAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
//Ropsten Address
const cfAddress = "0x9C950D476F05DcB0D44aa41c6E6DB0888Bc9181d";

const ProjectDetails = () => {
    let project_params = useParams();

    const [desc, setDesc] = useState("");

    const [totalBought, setTotalBought] = useState(0);
    const [totalClaimed, setTotalClaimed] = useState(0);
    const [projectDetails, setProjectDetails] = useState(null);
    const fetchProjectDetails = useCallback(async () => {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(cfAddress, CrowdfundingIDO.abi, provider)
            try {
                const project = await contract.information(project_params.projectId);
                setProjectDetails(project);
                setTotalClaimed(project.paidToOwner.toNumber());
                setTotalBought(project.params.totalBought.toNumber());
                fetch(project.params.description)
                    .then( r => r.text() )
                    .then( t => {
                        setDesc(t);
                    });
            } 
            catch (error) {
                alert("Err: " + error)
            }
        }
    }, [project_params]);

    const [youBought, setYouBought] = useState(0);
    const fetchYouBought = useCallback(async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(cfAddress, CrowdfundingIDO.abi, provider)
        try {
            const bought = await contract.boughtAmount(project_params.projectId, getCookie("account"));
            setYouBought(bought.toNumber());
        } 
        catch (error) {
            alert("Err: " + error)
        }
    }, [project_params]);

    const [tokenName, setTokenName] = useState(null);
    const fetchTokenName = useCallback(async () => {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(cfAddress, CrowdfundingIDO.abi, provider)
            try {
                const name = await contract.getIDOtokenName(project_params.projectId);
                setTokenName(name);
            } 
            catch (error) {
                alert("Err: " + error)
            }
        }
    }, [project_params]);

    const [tokenSymbol, setTokenSymbol] = useState(null);
    const fetchTokenSymbol = useCallback(async () => {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(cfAddress, CrowdfundingIDO.abi, provider)
            try {
                const symbol = await contract.getIDOtokenSymbol(project_params.projectId);
                setTokenSymbol(symbol);
            } 
            catch (error) {
                alert("Err: " + error)
            }
        }
    }, [project_params]);

    useEffect(() => {
        fetchProjectDetails();
        fetchTokenName();
        fetchTokenSymbol();

        if (getCookie("account")) {
            fetchYouBought();
        }

    }, [fetchProjectDetails, fetchYouBought, fetchTokenName, fetchTokenSymbol]);

    const convertTimestamp2Date = (timestamp) => {
        const d = new Date(timestamp);
        return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
    }

    const [amount, setAmount] = useState(0);
    const buyIDOToken = async () => {
        if (getCookie("account")) {
            if (amount <= 0 || amount % 1 !== 0) {
                toast.error("Invalid amount", {
                    position: "top-center",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                });
            }
            else {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const signer = provider.getSigner();
                const contract = new ethers.Contract(cfAddress, CrowdfundingIDO.abi, signer);
                try {
                    await contract.buy(project_params.projectId, amount, {value: amount});
                    setTotalBought(parseFloat(totalBought) + parseFloat(amount));
                    setYouBought(parseFloat(youBought) + parseFloat(amount));
                } 
                catch (error) {
                    toast.error(error.reason ? error.reason.substring(20) : error, {
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

    const withdraw = async () => {
        if (getCookie("account")) {
            if (totalBought === projectDetails.params.baseAmount.toNumber()) {
                toast.error("Cannot withdraw in a completed project", {
                    position: "top-center",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                });
            }
            else {
                if (amount <= 0 || amount % 1 !== 0) {
                    toast.error("Invalid amount", {
                        position: "top-center",
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                    });
                }
                else {
                    const provider = new ethers.providers.Web3Provider(window.ethereum)
                    const signer = provider.getSigner();
                    const contract = new ethers.Contract(cfAddress, CrowdfundingIDO.abi, signer);
                    try {
                        await contract.withdraw(project_params.projectId, amount);
                        setTotalBought(parseFloat(totalBought) - parseFloat(amount));
                        setYouBought(parseFloat(youBought) - parseFloat(amount));
                    } 
                    catch (error) {
                        toast.error(error.reason ? error.reason.substring(20) : error, {
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
            }
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

    const claimToken = async () => {
        if (getCookie("account")) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner();
            const contract = new ethers.Contract(cfAddress, CrowdfundingIDO.abi, signer);
            try {
                await contract.getPayout(project_params.projectId);
            } 
            catch (error) {
                toast.error(error.reason ? error.reason.substring(20) : error, {
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

    const getRaised = async () => {
        if (totalClaimed === 0) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner();
            const contract = new ethers.Contract(cfAddress, CrowdfundingIDO.abi, signer);
            try {
                await contract.getRaised(project_params.projectId);
                setTotalClaimed(totalBought);
            } 
            catch (error) {
                toast.error(error.reason ? error.reason.substring(20) : error, {
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
        else {
            toast.error("You already claimed", {
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

    return (
        <div className="details-page">
            <div className="details-header">
                <img src={projectDetails ? projectDetails.params.logoIPFS : null} alt="project-logo" className="details-logo" />
                <p className="details-pj-name">{projectDetails ? projectDetails.params.name : null}</p>
                <div>
                    {projectDetails ? (checkIDOstatus(projectDetails.params.open[0].toNumber(), projectDetails.params.open[1].toNumber()) === 0 ? <p className='detail-status-comingsoon'>Coming soon</p>
                                    : (checkIDOstatus(projectDetails.params.open[0].toNumber(), projectDetails.params.open[1].toNumber()) === 1 ? <p className='detail-status-opening'>Opening</p>
                                    : <p className='detail-status-ended'>Ended</p>)) : null}
                </div>
            </div>

            <div className="details-info">
                <div className="details-desc">
                    <img src={projectDetails ? projectDetails.params.bgIPFS : null} alt="project-bg" className="details-bg" />
                    <p className="details-desc-title">Description</p>
                    <hr className="details-hr" />
                    <p className="details-desc-text">
                    {desc}
                    </p>
                    <p className="details-desc-title">IDO Rules</p>
                    <hr className="details-hr" />
                    {/* IDO Rules Table */}
                    <table className="table">
                    <thead>
                    <tr>
                        <th scope="col">CROWDSALE RULE</th>
                        <th scope="col"></th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">Token Address</th>
                            <td>{projectDetails ? projectDetails.params.token : null}</td>
                        </tr>
                        <tr>
                            <th scope="row">Token Name</th>
                            <td>{tokenName ? tokenName : null}</td>
                        </tr>
                        <tr>
                            <th scope="row">Token Symbol</th>
                            <td>{tokenSymbol ? tokenSymbol : null}</td>
                        </tr>
                        <tr>
                            <th scope="row">Maximum Token Crowdsale</th>
                            <td>{projectDetails ? projectDetails.params.baseAmount.toNumber() : null}</td>
                        </tr>
                        <tr>
                            <th scope="row">Maximum Wei spent per investor</th>
                            <td>{projectDetails ? projectDetails.params.maxAmountPerAddress.toNumber() : null}</td>
                        </tr>
                        <tr>
                            <th scope="row">Multiplier</th>
                            <td>{projectDetails ? (projectDetails.params.multiplier)  : null}</td>
                        </tr>
                        <tr>
                            <th scope="row">Open</th>
                            <td>{projectDetails ? convertTimestamp2Date(projectDetails.params.open[0].toNumber() * 1000) : null}</td>
                        </tr>
                        <tr>
                            <th scope="row">End</th>
                            <td>{projectDetails ? convertTimestamp2Date(projectDetails.params.open[1].toNumber() * 1000) : null}</td>
                        </tr>
                    </tbody>
                    </table>
                </div>

                <div>
                    <div className="details-card">
                        <div className="details-fgoal">
                            <div>
                                <p className="details-fgoal-text">Base Amount</p>
                                <p className="details-goal-money">{projectDetails ? projectDetails.params.baseAmount.toNumber() : null}</p>
                            </div>
                            <img src={require('../../assets/images/mycoin.jpg')} alt="coin-icon" className="details-coin-logo" />
                        </div>
                        <div className="details-display-row">
                            <p>Total Bought</p>
                            <p>{totalBought}</p>
                        </div>

                        <Progressbar bgcolor="#0d6efd" progress={projectDetails ? (projectDetails.params.totalBought.toNumber() / projectDetails.params.baseAmount.toNumber() * 100) : 0} height={40} width={20}/>

                        {projectDetails ? (projectDetails.owner.toLowerCase() !== getCookie("account").toLowerCase() ?
                        <div className="details-display-row you-bought">
                            <p>You Bought</p>
                            <p>{youBought}</p>
                        </div> : null) : null}
                    
                        
                        <Form method="POST" className="details-donate-section">
                            {projectDetails ? (projectDetails.owner.toLowerCase() !== getCookie("account").toLowerCase() ?
                            <Form.Group>
                                <Form.Control className="details-input-donate" type="number" placeholder="Amount" name="donateAmount" 
                                    onChange={(e) => setAmount(e.target.value.length === 0 ? 0 : e.target.value)}  
                                />
                            </Form.Group> : null) : null}

                            {projectDetails ? (projectDetails.owner.toLowerCase() !== getCookie("account").toLowerCase() ?
                            (<div>
                                <div className="donate-section-btns">
                                    <Button variant="primary" className="details-donate-btn" onClick={buyIDOToken}><i className="fa-solid fa-coins"></i> Buy Token</Button>
                                    <Button variant="secondary" className="details-donate-btn" onClick={withdraw}><i className="fa fa-dollar"></i> Withdraw</Button>
                                </div>
                                <Button className="claim-token-btn" onClick={claimToken}><i className="fa-solid fa-sack-dollar"></i> Claim Token</Button>
                            </div>)
                            : <Button className="get-raised-btn" onClick={getRaised}><i className="fa-solid fa-sack-dollar"></i> Get Raised</Button>) : null}
                            <ToastContainer />
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )

};

export default ProjectDetails;