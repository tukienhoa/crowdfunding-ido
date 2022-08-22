import {useState} from 'react';
import {Form, Button} from 'react-bootstrap';

import {getCookie} from '../../utils/cookie';

import "./CreateProject.css";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { TextUpload } from '../../components/TextUpload';
import { ImageUpload } from '../../components/ImageUpload';

import { ethers } from 'ethers';
import CrowdfundingIDO from '../../artifacts/contracts/CrowdfundingIDO.sol/CrowdfundingIDO.json';
// const cfAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
//Ropsten Address
const cfAddress = "0x602BaC7aF27ED1aab5dd5912E456a5512CE34d70";

const CreateProject = () => {

    const [descriptionUrl, setDescriptionUrl] = useState("");
    const [bgUrl, setBgUrl] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    const [errors, setErrors] = useState({});
    const handleSubmit = async (e) => {
        e.preventDefault();

        var isValid = true;
        var errs = {};
        setErrors({});

        if (descriptionUrl.trim().length === 0) {
            isValid = false;
            errs["pjDesc"] = "Project description cannot be blank.";
        }
        if (bgUrl.trim().length === 0) {
            isValid = false;
            errs["pjBg"] = "Please upload project background image.";
        }
        if (logoUrl.trim().length === 0) {
            isValid = false;
            errs["pjLogo"] = "Please upload project logo image.";
        }
        if (e.target.pjName.value.trim().length === 0) {
            isValid = false;
            errs["pjName"] = "Project name cannot be blank.";
        }
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
        
        if (Date.parse(e.target.pjEnd.value) <= Date.parse(e.target.pjStart.value)) {
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
                            getCookie("account"),
                            e.target.pjTPWei.value,
                            [Date.parse(e.target.pjStart.value) / 1000, Date.parse(e.target.pjEnd.value) / 1000],
                            e.target.pjFGoal.value,
                            e.target.pjMaxWei.value,
                            0,
                            e.target.pjName.value.trim(),
                            descriptionUrl,
                            logoUrl,
                            bgUrl
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

            <div className="upload-ipfs-section">
                <p className="key-title">Project description</p>
                <TextUpload setUrl={setDescriptionUrl} />
                <p className="create-pj-err-msg">{errors.pjDesc}</p>
                {descriptionUrl}

                <p className="key-title">Project background image</p>
                <ImageUpload setUrl={setBgUrl} />
                <a href={bgUrl} target="_blank" rel="noopener noreferrer">
                    {bgUrl}
                </a>
                <p className="create-pj-err-msg">{errors.pjBg}</p>

                <p className="key-title">Project logo image</p>
                <ImageUpload setUrl={setLogoUrl} />
                <a href={logoUrl} target="_blank" rel="noopener noreferrer">
                    {logoUrl}
                </a>
                <p className="create-pj-err-msg">{errors.pjLogo}</p>
            </div>

            <Form method="POST" className="create-project-form" onSubmit={handleSubmit}>
                <Form.Group className="mb-3 lb-textfield">
                    <Form.Label className="key-title">Project name</Form.Label>
                    <Form.Control type="text" name="pjName" placeholder="My Project"/>
                </Form.Group>
                <p className="create-pj-err-msg">{errors.pjName}</p>

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
                    <Form.Label className="key-title">Max Wei spent per address</Form.Label>
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
                                  min={`${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${(today.getDate()).toString().padStart(2, "0")}T00:00`} 
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