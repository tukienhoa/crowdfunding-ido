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
const cfAddress = "0xB4e7f505350F38b8776FB758858Bc7C1B8c28d4e";

const ProjectDetails = () => {
    let project_params = useParams();

    // const [desc, setDesc] = useState("");
    // const fetchDesc = () => {
    //     const url = "https://ipfs.infura.io/ipfs/QmV1Zmhr6nFWw1u3rKZG3FuLH9AxfdLgxhAoKvUtVpH83X";
    //     fetch(url)
    //         .then( r => r.text() )
    //         .then( t => {
    //             console.log(t);
    //         })
    // }


    const [totalBought, setTotalBought] = useState(0);
    const [projectDetails, setProjectDetails] = useState(null);
    const fetchProjectDetails = useCallback(async () => {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(cfAddress, CrowdfundingIDO.abi, provider)
            try {
                const project = await contract.information(project_params.projectId);
                setProjectDetails(project);
                setTotalBought(project.params.totalBought.toNumber());
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
        // fetchDesc();

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
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner();
            const contract = new ethers.Contract(cfAddress, CrowdfundingIDO.abi, signer);
            try {
                await contract.withdraw(project_params.projectId, amount);
                setTotalBought(parseFloat(totalBought) - parseFloat(amount));
                setYouBought(parseFloat(youBought) - parseFloat(amount));
            } 
            catch (error) {
                toast.error(error.reason, {
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

    return (
        <div className="details-page">
            <div className="details-header">
                <img src={`https://picsum.photos/1024/1024?nocache=${project_params.projectId + 10000}`} alt="project-logo" className="details-logo" />
                <p className="details-pj-name">Project {project_params.projectId}</p>
            </div>

            <div className="details-info">
                <div className="details-desc">
                    <img src={`https://picsum.photos/1024/1024?nocache=${project_params.projectId}`} alt="project-bg" className="details-bg" />
                    <p className="details-desc-title">Description</p>
                    <hr className="details-hr" />
                    <p className="details-desc-text">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                    </p>
                    {/* <p>{desc}</p> */}
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
                            <td>{projectDetails ? (projectDetails.params.multiplier[0] / projectDetails.params.multiplier[1])  : null}</td>
                        </tr>
                        <tr>
                            <th scope="row">Raise goal</th>
                            <td>{projectDetails ? (projectDetails.params.baseAmount.toNumber() / (projectDetails.params.multiplier[0] / projectDetails.params.multiplier[1])) : null}</td>
                        </tr>
                        <tr>
                            <th scope="row">Open range</th>
                            <td>{projectDetails ? `${convertTimestamp2Date(projectDetails.params.open[0].toNumber() * 1000)} - ${convertTimestamp2Date(projectDetails.params.open[1].toNumber() * 1000)}` 
                                                  : null}</td>
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

                        {/* <Progressbar bgcolor="#0d6efd" progress={projectDetails.donation / projectDetails.goal * 100} height={40} width={20}/> */}
                        <Progressbar bgcolor="#0d6efd" progress={projectDetails ? (projectDetails.params.totalBought.toNumber() / projectDetails.params.baseAmount.toNumber() * 100) : 0} height={40} width={20}/>

                        {/* {projectDetails.publicKey === getCookie("publicKey")
                            ? <Button variant="secondary" className="details-own-pj-btn" disabled>This is your project!</Button>
                            :
                            (projectDetails.pjStatus === 0 ?
                                <Form method="POST" className="details-donate-section" onSubmit={(e) => handleDonate(e)}>
                                    <Form.Group>
                                        <Form.Control className="details-input-donate" type="number" placeholder="Donate amount" name="donateAmount" required />
                                    </Form.Group>
                                    <Button type="submit" variant="primary" className="details-donate-btn"><i className="fa-regular fa-heart"></i> Donate</Button>
                                    <ToastContainer />
                                </Form>
                                : <Button variant="success" className="details-funded-pj-btn" disabled>Project funded</Button>
                            )} */}

                        <div className="details-display-row you-bought">
                            <p>You Bought</p>
                            <p>{youBought}</p>
                        </div>
                        
                        <Form method="POST" className="details-donate-section">
                            <Form.Group>
                                <Form.Control className="details-input-donate" type="number" placeholder="Amount" name="donateAmount" 
                                    onChange={(e) => setAmount(e.target.value.length === 0 ? 0 : e.target.value)}  
                                />
                            </Form.Group>
                            <div className="donate-section-btns">
                                <Button variant="primary" className="details-donate-btn" onClick={buyIDOToken}><i className="fa-solid fa-coins"></i> Buy Token</Button>
                                <Button variant="secondary" className="details-donate-btn" onClick={withdraw}><i className="fa fa-dollar"></i> Withdraw</Button>
                            </div>
                            <ToastContainer />
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )

};

export default ProjectDetails;