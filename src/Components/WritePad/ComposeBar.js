import React, { useState } from "react";
import WritePad from "./WritePad";
import "./WritePad.css";
import Alert from "../utils/Alert";
import Deso from "deso-protocol";

import { timeDelay } from "../utils/desoMath";
const deso = new Deso();
export default function ComposeBar(props) {
  const [listOfPost, setListOfPost] = useState([
    {
      serial: 1,
      Body: "",
      ImageURL: [""],
    },
  ]);
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUplaoing] = useState(false);
  const [headerImage, setHeaderImage] = useState(listOfPost[0].ImageURL[0]);
  const [showModal, setShowModal] = useState(false);
  const [postedHash, setPostedHash] = useState("");

  const publishPost = async () => {
    console.log(listOfPost)
    setIsPosting(true);
    const extraData = {
      app: "DesoHive",
    };
    var lastLoggedInUser = localStorage.getItem("deso_user_key").toString();
    console.log(lastLoggedInUser + "test");
    let parentStakeId = "";
    for (let i = 0; i < listOfPost.length; i++) {
      let postBody = listOfPost[i].Body;
      let imageURL = listOfPost[i].ImageURL;
      let serial = listOfPost[i].serial;
      try {
        const submitPost = await deso.posts.submitPost({
          UpdaterPublicKeyBase58Check: lastLoggedInUser,
          BodyObj: {
            Body: postBody,
            ImageURL: imageURL,
          },

          PostExtraData: extraData,
          PostHashHexToModify: "",
          RepostedPostHashHex: "",
          ParentStakeID: parentStakeId,
        });
        //console.log(submitPost);
        
       
        let postHashHex = submitPost.PostHashHex;
        if (serial === 1) {
          parentStakeId = postHashHex;
          await timeDelay(2000);

        }
      } catch (e) {
        console.log(e);
        setIsPosting(false);
        alert(
          "Something went wrong..Please retry.\nIf this keeps happening, please reload page"
        );
      }
    }
    // emtpy listOfPost
    setListOfPost([
      {
        serial: 1,
        Body: "",
        ImageURL: [""],
      },
    ]);
    setIsPosting(false);

    setPostedHash(parentStakeId);
    // setShowModal(true);
    setHeaderImage("");
    alert("Your thread was posted succesfully!");
    //window.location.reload();
  };

  const handleImageUpload = async (event) => {
    let rawImage = event.target.files[0];
    console.log("in upload");
    console.log(event.target.files[0]);
    if (rawImage === "undefined") {
      return;
    }
    setIsUplaoing(true);
    let JWTToken = await deso.identity.getJwt(undefined);
    console.log(JWTToken);
    let serial = event.target.id;
    console.log("before jwt token");
    console.log(JWTToken);
    console.log(serial);

    const publicKeyOfUser = localStorage.getItem("deso_user_key").toString();
    try {
      let uploadImage = await props.desoApi.uploadImage(
        rawImage,
        publicKeyOfUser,
        JWTToken.toString()
      );
      if (uploadImage) {
        let imageURL = uploadImage.ImageURL;
        let tempListOfPost = listOfPost;
        for (let i = 0; i < tempListOfPost.length; i++) {
          if (tempListOfPost[i].serial === parseInt(serial)) {
            tempListOfPost[i].ImageURL = [imageURL];
          }
          setListOfPost(tempListOfPost);
          setHeaderImage(imageURL);
          setIsUplaoing(false);
        }
      } else {
        alert("something went wrong while uploading image");
        setIsUplaoing(false);
      }
    } catch (e) {
      console.log(e);
      alert("Something went wrong while uploading image");
      setIsUplaoing(false);
    }
    //insert ImageURL in listOfPost where serial is equal to serial
  };

  const handleCloseAlert = () => {
    setShowModal(false);
  };
  const handleImageDelete = () => {
    //set image URL to empty string in listOfPost at first index
    let tempListOfPost = listOfPost;
    tempListOfPost[0].ImageURL = [""];
    setListOfPost(tempListOfPost);
    setHeaderImage("");
  };

  const handleTextChanges = (e) => {
    let textValue = e.target.value;
    //console.log(textValue);
    let serial = e.target.id;

    setListOfPost((prevState) => {
      let tempListOfPost = prevState;
      for (let i = 0; i < tempListOfPost.length; i++) {
        if (tempListOfPost[i].serial === parseInt(serial)) {
          tempListOfPost[i].Body = textValue;
        }
      }
      return tempListOfPost;
    });
  };

  const handleAddComment = (serial) => {
    // add new comment after serial in listOfPost
    let newListOfPost = [...listOfPost];
    newListOfPost.splice(serial, 0, {
      serial: serial + 1,
      Body: "",
      ImageURL: [],
    });
    // increment serial of all comments after serial
    for (let i = serial + 1; i < newListOfPost.length; i++) {
      newListOfPost[i].serial += 1;
    }
    // set textbox value to body where id is equal to serial

    setListOfPost(newListOfPost);
    console.log("inserted");
    console.log(listOfPost);
  };
  const handleDeleteComment = (serial) => {
    setListOfPost(listOfPost.filter((post) => post.serial !== serial));
  };

  return (
    <>
      <div className='container my-5 py-4 px-4 compose-container'>
        <div className='row compose-header'>
          <div className='col'>
            <div className=' post-image'>
              <i className='fas fa-comment-dots'></i>
            </div>
          </div>
          <div className='col-11'>
            <h2 className='compose-heading'>Create a post</h2>
            <p className='compose-para'>
              Create a high-performing post to get your message across.
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
            type='success'
            alertBody='Post Successful!'
            postHash={postedHash}
            handleCloseAlert={handleCloseAlert}
          />
        ) : (
          ""
        )}

        {isUploading ? <p>Uploading Image...</p> : ""}
        {headerImage !== "" ? (
          <div className='row' id='image-preview'>
            <div className='col-2'>
              <div
                className='postHeaderImage'
                style={{
                  backgroundImage: `url(${headerImage})`,
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

        {/* loops writePadCount time and render wriPad*/}
        {listOfPost.map((post) => {
          console.log("change");
          return (
            <WritePad
              key={post.serial}
              serial={post.serial}
              body={post.Body}
              imageURL={post.ImageURL}
              handleTextChanges={handleTextChanges}
              handleAddComment={handleAddComment}
              handleDeleteComment={handleDeleteComment}
              handleImageUpload={handleImageUpload}
            />
          );
        })}
      </div>
    </>
  );
}
