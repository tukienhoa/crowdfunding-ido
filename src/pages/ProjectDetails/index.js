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
const cfAddress = "0xd153ef3376eDdf00cb8841b644dCDA262fa97980";

const ProjectDetails = () => {
    let project_params = useParams();

    const [projectDetails, setProjectDetails] = useState(null);
    const fetchProjectDetails = useCallback(async () => {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const contract = new ethers.Contract(cfAddress, CrowdfundingIDO.abi, provider)
            try {
                const project = await contract.information(project_params.projectId);
                setProjectDetails(project);
            } 
            catch (error) {
                alert("Err: " + error)
            }
        }
    }, [project_params]);

    useEffect(() => {
        fetchProjectDetails();
    }, [fetchProjectDetails]);

    const handleDonate = (e) => {
        e.preventDefault();

        if (getCookie("account")) {
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

    const convertTimestamp2Date = (timestamp) => {
        const d = new Date(timestamp);
        return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
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

                    <p className="details-desc-title">IDO Rules</p>
                    <hr className="details-hr" />
                    {/* IDO Rules Table */}
                    <p>Token Address {projectDetails ? projectDetails.params.token : null}</p>
                    <p>Token Name </p>
                    <p>Maximum Token Crowdsale {projectDetails ? projectDetails.params.baseAmount.toNumber() : null}</p>
                    <p>Maximum Wei spent per investor {projectDetails ? projectDetails.params.maxAmountPerAddress.toNumber() : null}</p>
                    <p>Multiplier {projectDetails ? (projectDetails.params.multiplier[0] / projectDetails.params.multiplier[1])  : null}</p>
                    <p>Raise goal {projectDetails ? (projectDetails.params.baseAmount.toNumber() / (projectDetails.params.multiplier[0] / projectDetails.params.multiplier[1])) : null}</p>
                    <p>Open range {projectDetails ? `${convertTimestamp2Date(projectDetails.params.open[0].toNumber())} - ${convertTimestamp2Date(projectDetails.params.open[1].toNumber())}` 
                                                  : null}
                    </p>

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
                            <p>{projectDetails ? projectDetails.params.totalBought.toNumber() : null}</p>
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
                        <Form method="POST" className="details-donate-section" onSubmit={(e) => handleDonate(e)}>
                            <Form.Group>
                                <Form.Control className="details-input-donate" type="number" placeholder="Donate amount" name="donateAmount" required />
                            </Form.Group>
                            <Button type="submit" variant="primary" className="details-donate-btn"><i className="fa-regular fa-heart"></i> Donate</Button>
                            <ToastContainer />
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )

};

export default ProjectDetails;