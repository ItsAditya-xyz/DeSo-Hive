import React from "react";
import Deso from "deso-protocol";
import { useState, useEffect } from "react";
import logo from "../../assets/images/logo.svg";
import axios from "axios";
import Alert from "../utils/Alert";

export default function Anon(props) {
  const [isPosting, setIsPosting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bodyContent, setBodyContent] = useState("");
  const [postHashHex, setPostHashHex] = useState("");

  const [wasPostSuccessful, setWasPostSuccessful] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleTextChanges = (e) => {
    setBodyContent(e.target.value);
    //
  };
  const publishPost = async () => {
    if (bodyContent.length == 0) {
      alert("Please enter some text to post");
      return;
    }
    setIsPosting(true);
    //MAKE A POST RQUEST USING AJAX
    const request = {
      content: bodyContent,
    };
    axios({
      method: "post",
      url: "https://mintedtweets.cordify.app/post-anonymously",
      data: request,
    })
      .then((res) => {
        const response = res.data;
        if (response.status) {
          setBodyContent("");
          setWasPostSuccessful(true);
          setPostHashHex(response.data.PostEntryResponse.PostHashHex);
          setShowModal(true);
        } else {
          setWasPostSuccessful(false);
        }
        setIsPosting(false);
      })
      .catch((err) => {
        console.log(err);
        setIsPosting(false);
        setShowModal(true);
      });
  };
  useEffect(async () => {}, []);

  return (
    <>
      <nav className=' navbar navbar-dark bg-dark navbar-inverse'>
        <div className='container-fluid'>
          <div className='d-flex'>
            <a className='navbar-brand' href='/'>
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
        </div>
      </nav>

      <div className='continer d-flex justify-content-center m-5 mx-2'>
        <h1 className='text-center'>
          Post on Deso Anonymously through{" "}
          <a href='https://diamondapp.com/u/AnonVoice' target={"_blank"}>
            <span className='text-primary text-underline'>
              <u>@AnonVoice</u>
            </span>
          </a>
        </h1>
      </div>
      <div className='d-flex justify-content-center'>
        <div className='container my-5 mx-2 py-4 px-4 compose-container'>
          <div className='row compose-header'>
            <div className='col'>
              <div className=' post-image'>
                <i className='fas fa-comment-dots'></i>
              </div>
            </div>
            <div className='col-11'>
              <h2 className='compose-heading'>Create a post</h2>
              <p className='compose-para'>
                Express yourself anonymously ❤️ || Be humble and nice
              </p>
            </div>
          </div>

          <button
            className={`btn btn-primary shadow-sm ${
              isPosting ? "disabled" : " "
            }`}
            style={{ width: "90px" }}
            onClick={publishPost}>
            {isPosting ? <div className='loading'>Posting...</div> : "Post"}
          </button>
          {showModal ? (
            <Alert
              type={wasPostSuccessful ? "success" : "danger"}
              alertBody={
                wasPostSuccessful
                  ? "Your post was successfully made!"
                  : "Something went wrong. Please try again."
              }
              postHash={wasPostSuccessful ? postHashHex : null}
              handleCloseAlert={handleCloseModal}
            />
          ) : (
            ""
          )}

          <div className='WritePadBoox'>
            <textarea
              onChange={handleTextChanges}
              value={bodyContent}
              className='form-control textContainer'
              style={{
                resize: "none",
                minHeight: "250px",
                border: "none",
                borderBottom: "1px solid rgb(218, 218, 218)",
              }}></textarea>
          </div>
        </div>
      </div>
    </>
  );
}
