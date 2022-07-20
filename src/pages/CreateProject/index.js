import {useState} from 'react';
import {Form, FormControl, InputGroup, Button} from 'react-bootstrap';

import {getCookie} from '../../utils/cookie';

import "./CreateProject.css";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ethers } from 'ethers';
import CrowdfundingIDO from '../../artifacts/contracts/CrowdfundingIDO.sol/CrowdfundingIDO.json';
// const cfAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
//Ropsten Address
const cfAddress = "0xd153ef3376eDdf00cb8841b644dCDA262fa97980";

const CreateProject = () => {

    const [errors, setErrors] = useState({});
    const handleSubmit = async (e) => {
        e.preventDefault();

        var isValid = true;
        var errs = {};
        setErrors({});

        if (e.target.pjTName.value.trim().length === 0) {
            isValid = false;
            errs["pjTName"] = "Token name cannot be blank.";
        }
        if (e.target.pjTSymbol.value.trim().length === 0) {
            isValid = false;
            errs["pjTSymbol"] = "Token symbol cannot be blank.";
        }
        if (e.target.pjFGoal.value <= 0) {
            isValid = false;
            errs["pjFGoal"] = "Invalid value.";
        }
        if (e.target.pjTPWei.value <= 0) {
            isValid = false;
            errs["pjTPWei"] = "Invalid value.";
        }
        if (e.target.pjMaxWei.value <= 0) {
            isValid = false;
            errs["pjMaxWei"] = "Invalid value.";
        }
        
        if (Date.parse(e.target.pjEnd.value) < Date.parse(e.target.pjStart.value)) {
            isValid = false;
            errs["pjDate"] = "Start time must be before end time.";
        }

        setErrors(errs);

        if (isValid) {
            if (typeof window.ethereum !== 'undefined') {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(cfAddress, CrowdfundingIDO.abi, signer);
                try {
                    await contract.publish(
                        e.target.pjTName.value.trim(),
                        e.target.pjTSymbol.value.trim(),
                        [
                            true, 
                            getCookie("account"),
                            [1, 1],
                            [Date.parse(e.target.pjStart.value), Date.parse(e.target.pjEnd.value)],
                            10,
                            e.target.pjFGoal.value,
                            // e.target.pjTPWei.value,
                            e.target.pjMaxWei.value,
                            0
                        ],
                        [
                            ["0x0000000000000000000000000000000000000000", 0, 0, false],
                            ["0x0000000000000000000000000000000000000000", 0, 0, false], 
                            ["0x0000000000000000000000000000000000000000", 0, 0, false], 
                            ["0x0000000000000000000000000000000000000000", 0, 0, false], 
                            ["0x0000000000000000000000000000000000000000", 0, 0, false]
                        ]

                    );
                    toast.success('Project published', {
                        position: "top-center",
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                    });
                } 
                catch(err) {
                    toast.error('Error: ' + err, {
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

    const today = new Date(Date.now());
    
    return (
        <div className="create-fund-pj">
            <p className="create-fund-pj-title">Create Your Funding Project</p>

            <Form method="POST" className="create-project-form" onSubmit={handleSubmit}>
                <Form.Group className="mb-3 lb-textfield">
                    <Form.Label className="key-title">Token name</Form.Label>
                    <Form.Control type="text" name="pjTName" placeholder="My Token"/>
                </Form.Group>
                <p className="create-pj-err-msg">{errors.pjTName}</p>

                <Form.Group className="mb-3 lb-textfield">
                    <Form.Label className="key-title">Token symbol</Form.Label>
                    <Form.Control type="text" name="pjTSymbol" placeholder="MTK"/>
                </Form.Group>
                <p className="create-pj-err-msg">{errors.pjTSymbol}</p>

                <Form.Group className="mb-3 lb-textfield">
                    <Form.Label className="key-title">Funding goal</Form.Label>
                    <Form.Control type="number" name="pjFGoal" required/>
                </Form.Group>
                <p className="create-pj-err-msg">{errors.pjFGoal}</p>

                <Form.Group className="mb-3 lb-textfield">
                    <Form.Label className="key-title">Tokens per Wei</Form.Label>
                    <Form.Control type="number" name="pjTPWei" required/>
                </Form.Group>
                <p className="create-pj-err-msg">{errors.pjTPWei}</p>

                <Form.Group className="mb-3 lb-textfield">
                    <Form.Label className="key-title">Max Wei spended per address</Form.Label>
                    <Form.Control type="number" name="pjMaxWei" required/>
                </Form.Group>
                <p className="create-pj-err-msg">{errors.pjMaxWei}</p>

                <Form.Group className="mb-3 lb-textfield">
                    <Form.Label className="key-title">Start</Form.Label>
                    <Form.Control type="datetime-local" name="pjStart" 
                                  min={`${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}T00:00`} 
                    required/>
                </Form.Group>

                <Form.Group className="mb-3 lb-textfield">
                    <Form.Label className="key-title">End</Form.Label>
                    <Form.Control type="datetime-local" name="pjEnd" 
                                  min={`${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${(today.getDate() + 1).toString().padStart(2, "0")}T00:00`} 
                    required/>
                </Form.Group>
                <p className="create-pj-err-msg">{errors.pjDate}</p>

                <div className="start-pj-btn">
                    <Button variant="primary" type="submit">Publish Project</Button> 
                </div>
            </Form>
            <ToastContainer />
        </div>
    )
}

export default CreateProject;