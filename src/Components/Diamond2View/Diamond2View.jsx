import React from 'react';
import { useEffect, useState, useRef } from 'react';
import logo from "../../assets/images/logo.svg"
import Deso from "deso-protocol";
import Alert from '../utils/Alert';
function Diamond2View(props) {
    const deso = new Deso();
    const inputElement = useRef();
    const [textInput, setTextInput] = useState("");
    const [loggedInPublicKey, setLoggedInPublicKey] = useState("");
    const [uploadedImage, setUploadedImage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [postedHash, setPostedHash] = useState("");
    const [diamondLevel, setDiamondLevel] = useState(1);
    const handleLogin = async () => {
        const request = 3;
        const response = await deso.identity.login(request);
        console.log(response)
        if (response) {
            localStorage.setItem("loggedInPublicKey", response.key);
            setLoggedInPublicKey(response.key);

        }
    }
    const handleTextChanges = (e) => {
        setTextInput(e.target.value);
    }

    const handleImageUpload = async () => {

        setIsUploading(true);
        const request = {
            "UserPublicKeyBase58Check": loggedInPublicKey
        };
        const response = await deso.media.uploadImage(request);
        setUploadedImage(response.ImageURL);
        setIsUploading(false);
    }

    const handleImageDelete = async () => {
        setUploadedImage("");
    }

    const encrptAndPost = async () => {
        try {
            if (!textInput) {
                alert("Please enter some text");
                return;
            }
            if (diamondLevel < 1 || diamondLevel > 6) {
                alert("Please enter a valid diamond level");
                return;
            }
            setIsPosting(true);
            const ContentToEncrypt = JSON.stringify({
                "content": textInput,
                "image": uploadedImage,
                "dimaondLevel": diamondLevel
            })
            const request = {
                "content": ContentToEncrypt,
                "toEncrypt": true,
            }
            //make post request to https://mintedtweets.com/a/
            const response = await fetch("https://mintedtweets.cordify.app/parse-data-cryptographically", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(request)
            });
            const data = await response.json();
            let encryptedData = data["response"]
            let diamondString = `💎💎💎💎💎💎`.slice(0, parseInt(diamondLevel) * 2);
            console.log(diamondString)
            const postRequest = {
                "UpdaterPublicKeyBase58Check": loggedInPublicKey,
                "BodyObj": {
                    "Body": `This Post is Gated by ${diamondString} diamonds using @DesoHive_`,

                    "VideoURLs": [],
                    "ImageURLs": []
                },
                "PostExtraData": {
                    "gatedDiamondLevel": `${parseInt(diamondLevel)}`,
                    "EncryptedData": encryptedData,

                },
            };
            console.log(`${diamondLevel}`)
            const response2 = await deso.posts.submitPost(postRequest);
            console.log(response2);
            const createdPostHashHex = response2.submittedTransactionResponse.PostEntryResponse.PostHashHex;
            // make a delay of 2 seconds
            if (!createdPostHashHex) {
                alert("Something went wrong");
                setIsPosting(false);
                return;
            }
            await new Promise(r => setTimeout(r, 2000));
            const EditpostRequest = {
                "UpdaterPublicKeyBase58Check": loggedInPublicKey,
                "BodyObj": {
                    "Body": `This Post is Gated by ${diamondString} diamonds using @DesoHive_\n\nView at https://desohive.com/view/${createdPostHashHex}`,

                    "VideoURLs": [],
                    "ImageURLs": []
                },
                "PostExtraData": {
                    "gatedDiamondLevel": `${parseInt(diamondLevel)}`,
                    "EncryptedData": encryptedData,

                },
                "PostHashHexToModify": createdPostHashHex
            };
            const response3 = await deso.posts.submitPost(EditpostRequest);
            setPostedHash(createdPostHashHex);
            setIsPosting(false);
            setShowModal(true);



        }
        catch (err) {
            console.log(err)
            alert(`Error: ${err}`)
        }

    }
    useEffect(() => {
        const loggedInPublicKey = localStorage.getItem("loggedInPublicKey");
        if (loggedInPublicKey) {
            setLoggedInPublicKey(loggedInPublicKey);
        }
    }, []);
    return (
        <div>
            <nav className=' navbar navbar-dark bg-dark navbar-inverse'>
                <div className='container-fluid'>
                    <div className='d-flex'>
                        <a className='navbar-brand' href='#'>
                            <img
                                src={logo}
                                alt=''
                                width='40'
                                height='40'
                                className='d-inline-block align-text-top'
                            />
                        </a>
                        <a className='navbar-brand align-self-center' href='/'>
                            DeSo Hive
                        </a>
                    </div>

                    <div className='nav navbar-nav navbar-right align-self-center d-flex flex-row'>

                        {!loggedInPublicKey && <button
                            className='btn btn-primary btn-sm'
                            onClick={handleLogin}
                        >
                            Log In With DeSo
                        </button>}
                        {loggedInPublicKey && <img
                            src={`https://diamondapp.com/api/v0/get-single-profile-picture/${loggedInPublicKey}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                            alt=''
                            width='40'
                            height='40'
                            style={{ borderRadius: "50%" }}
                            className='d-inline-block align-text-top'
                        >
                        </img>}
                        {loggedInPublicKey && <button
                            className='btn btn-primary btn-sm'
                            onClick={() => { localStorage.removeItem("loggedInPublicKey"); setLoggedInPublicKey("") }}
                        >Log Out</button>}
                    </div>
                </div>
            </nav>

            {!loggedInPublicKey && (
                <div className='container-fluid front-container '>
                    <h1>
                        Create
                        <span className='text-primary'> Content</span> and gate it behind DeSo Diamonds
                    </h1>
                    <div className='sub'>
                        <p>
                            <strong>Diamond To View</strong> enables users to create content and gate it behind a DeSo Diamond with simple to use UI
                        </p>

                        <div className='get-started'>
                            <button
                                className='btn btn-lg btn-primary shadow'
                                style={{ minWidth: "220px", minHeight: "65px" }}
                                onClick={handleLogin}>
                                Get Started
                            </button>
                        </div>
                        <br />
                        <br />
                    </div>
                </div>
            )}
            {loggedInPublicKey && (


                <div className='container my-5 py-4 px-4 compose-container'>
                    <div className='row compose-header'>
                        <div className='col'>
                            <div className=' post-image'>
                                <i className='fas fa-comment-dots'></i>
                            </div>
                        </div>
                        <div className='col-11'>
                            <h2 className='compose-heading'>Create Post</h2>
                            <p className='compose-para'>
                                Create your post to gate it behind DeSo Diamond
                            </p>
                        </div>
                    </div>

                    <button
                        className={`btn btn-primary shadow-sm ${isPosting ? "disabled" : " "
                            }`}
                        style={{ width: "90px" }}
                        onClick={encrptAndPost}>
                        {isPosting ? <div className='loading'>Posting...</div> : "Post"}
                    </button>
                    {showModal ? (
                        <Alert
                            type='success'
                            alertBody='Post Successful!'
                            postHash={postedHash}
                            handleCloseAlert={() => setShowModal(false)}
                        />
                    ) : (
                        ""
                    )}

                    {isUploading ? <p>Uploading Image...</p> : ""}
                    {uploadedImage !== "" ? (
                        <div className='row' id='image-preview'>
                            <div className='col-2'>
                                <div
                                    className='postHeaderImage'
                                    style={{
                                        backgroundImage: `url(${uploadedImage})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        width: "250px",
                                        height: "200px",
                                        borderRadius: "10px",
                                        marginTop: "15px",
                                    }}></div>
                            </div>
                            <div className='col'>
                                <button
                                    className='btn btn-danger fas fa-trash'
                                    onClick={handleImageDelete}
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        color: "white",
                                        borderRadius: "50%",
                                    }}></button>
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                    <div className='WritePadBoox'>
                        <textarea
                            onChange={handleTextChanges}
                            className='form-control textContainer'
                            value={textInput}
                            style={{
                                resize: "none",
                                minHeight: "250px",
                                border: "none",
                                borderBottom: "1px solid rgb(218, 218, 218)",
                            }}></textarea>

                        <div className='container'>
                            <div className='row'>
                                <div className='col-10'>


                                    <button
                                        className='btn fa fa-image '
                                        onClick={handleImageUpload}>Upload Image</button>
                                </div>
                                <div className="d-flex align-items-center my-2" >
                                    <p>Dimaond Level to Gate With: </p>
                                    <input type="number"
                                        className="form-control"
                                        value={diamondLevel}
                                        onChange={(e) => setDiamondLevel(e.target.value)}
                                        placeholder="Diamond Level" />
                                </div>

                            </div>
                        </div>
                    </div>

                </div>

            )}



        </div>
    );
}

export default Diamond2View;