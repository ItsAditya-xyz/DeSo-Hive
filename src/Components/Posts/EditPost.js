import React, { useState, useRef, useEffect } from "react";
import "./editPost.css";
export default function EditPost(props) {
  const textAreaRef = useRef(null);
  const extraDataArea = useRef(null);
  const iamgeUploadRef = useRef(null);
  const [isSearching, setIsSerching] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  const [postFound, setPostFound] = useState(false);
  const [post, setPost] = useState();
  const [scrollHeight, setScrollHeight] = useState(10);
  const [extraDataScroll, setExtraDataScroll] = useState(10);
  const [extraData, setExtraData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [posterKey, setPosterKey] = useState(null);
  const [loggedInKey, setLoggedInKey] = useState(null);
  const [isPosting, setIsPosting] = useState(null);
  const [originalPostHashHex, setOriginalPostHashHex] = useState(null);
  const [recloutedPostHashHex, setRecloutedPostHashHex] = useState(null);
  useEffect(() => {
    const publicKeyOfUser = JSON.parse(
      localStorage.getItem("identityUsersV2")
    ).publicKey.toString();
    setLoggedInKey(publicKeyOfUser);
  }, []);

  const updatePost = async () => {
    setIsPosting(true);
    const extraDataJson = JSON.parse(extraData);
    const lastLoggedInUser = loggedInKey;
    const iamgeList = [imageURL ? imageURL : ""];
    let parentStakeId = "";
    try {
      const submitPost = await props.desoApi.submitPost(
        lastLoggedInUser,
        post,
        extraDataJson,
        parentStakeId,
        iamgeList,
        originalPostHashHex,
        recloutedPostHashHex ? recloutedPostHashHex : ""
      );
      const transactionHex = submitPost.TransactionHex;
      const signedTransaction = await props.desoIdentity.signTxAsync(
        transactionHex
      );
      const submitTransaction = await props.desoApi.submitTransaction(
        signedTransaction
      );
      //check status code of submitTransaction

      if (submitTransaction) {
        setIsPosting(false);
        alert("Post updated successfully!");
        window.location.reload();
        return;
      }
    } catch (e) {
      console.log(e);
      setIsPosting(false);
      alert(
        "Something went wrong..Please retry.\nIf this keeps happening, please reload page"
      );
      return;
    }
    setIsPosting(false);
    alert("Error while updating post...");
    window.location.reload();
  };

  const handleTextChange = (e) => {
    const currenctPost = e.target.value;
    setPost(currenctPost);
    const currentScrollHeight = textAreaRef.current.scrollHeight;
    setScrollHeight(currentScrollHeight);
  };

  const handleImageDelete = () => {
    //set image URL to empty string in listOfPost at first index
    setImageURL(null);
  };
  const handleImageUpload = async (event) => {
    let rawImage = event.target.files[0];
    console.log(rawImage);
    console.log("in upload");
    console.log(event.target.files[0]);
    if (rawImage === "undefined") {
      return;
    }
    setIsUploading(true);
    let JWTToken = await props.desoIdentity.getJWT();
    let serial = event.target.id;
    console.log("before jwt token");
    console.log(JWTToken);
    console.log(serial);

    const publicKeyOfUser = JSON.parse(
      localStorage.getItem("identityUsersV2")
    ).publicKey.toString();
    try {
      let uploadImage = await props.desoApi.uploadImage(
        rawImage,
        publicKeyOfUser,
        JWTToken
      );
      if (uploadImage) {
        let imageURL = uploadImage.ImageURL;
        setImageURL(imageURL);
      } else {
        alert("something went wrong while uploading image");
        setIsUploading(false);
      }
    } catch (e) {
      console.log(e);
      alert("Something went wrong while uploading image");
      setIsUploading(false);
    }
  };

  const handleExtraDataChange = (e) => {
    const currentExtraData = e.target.value;
    setExtraData(currentExtraData);
    const currentScrollHeightOfExtraData = extraDataArea.current.scrollHeight;
    setExtraDataScroll(currentScrollHeightOfExtraData);
  };
  const handlePostSearch = async () => {
    setIsSerching(true);
    const inputText = document.getElementById("postSearch").value;
    //use regex to find postHashHex of 64 chracters from URL https://diamondapp.com/posts/dc5ca3c2b2ebcbbf8b6eb58824400021ff0a63c94f5d76260167e6a8a6ec3ab7
    const postHashHex = inputText.match(/[a-f0-9]{64}/g);

    if (postHashHex != null) {
      try {
        const getSinglePost = await props.desoApi.getSinglePost(postHashHex[0]);
        setOriginalPostHashHex(postHashHex[0]);
        const postFound = getSinglePost.PostFound;
        setPost(postFound.Body);
        setPosterKey(postFound.PosterPublicKeyBase58Check);
        setExtraData(JSON.stringify(postFound.PostExtraData, null, 2));
        const recloutedPost = postFound.RepostedPostEntryResponse;
        if (recloutedPost) {
          setRecloutedPostHashHex(recloutedPost.PostHashHex);
        }
        if (postFound.ImageURLs) {
          if (postFound.ImageURLs[0] !== "") {
            setImageURL(postFound.ImageURLs[0]);
          }
        }
        setPostFound(postFound);
      } catch (e) {
        setIsSerching(false);
        alert.log("Something went wrong! Try again...");
      }

      setIsSerching(false);
      try {
        setExtraDataScroll(extraDataArea.current.scrollHeight);
        setScrollHeight(textAreaRef.current.scrollHeight);
      } catch {
        console.log("no post rendered");
      }
    } else {
      setIsSerching(false);
      alert("Post not found!");
    }
  };
  return (
    <>
      <div className='container my-5'>
        <h3 className='text-center'>Enter post URL to edit</h3>
        <div className=' d-flex  justify-content-center'>
          <div className='input-group mb-3 my-4 searchBox '>
            <input
              type='text'
              className='form-control'
              placeholder='DeSo post URL or postHashHex'
              aria-label='postURL'
              aria-describedby='basic-addon1'
              id='postSearch'
            />
            <div className='input-group-append'>
              <button
                className={`btn  btn-primary  ${
                  isSearching ? "disabled" : null
                }`}
                type='button'
                onClick={handlePostSearch}>
                {isSearching ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm'
                      role='status'
                      aria-hidden='true'></span>
                    &#160;
                    <span className=''>Searching...</span>
                  </>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </div>
        </div>
        {postFound ? (
          loggedInKey === posterKey ? (
            <div
              className='container my-5'
              style={{
                maxWidth: "900px",
              }}>
              <div className='d-flex justify-content-between mx-3'>
                <div className='d-flex align-items-center'>
                  <img
                    src={`https://diamondapp.com/api/v0/get-single-profile-picture/${postFound.PosterPublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                    className='rounded-circle'
                    alt='profile'
                    width='50'
                    height='50'
                  />
                  <h5 className='mx-2 card-title'>
                    <strong>{postFound.ProfileEntryResponse.Username}</strong>
                  </h5>
                </div>
              </div>

              <div className='container'>
                <div className=' WritePadBoox shadow-sm'>
                  <textarea
                    className='form-control textContainer'
                    value={post}
                    onChange={handleTextChange}
                    ref={textAreaRef}
                    style={{
                      height: `${scrollHeight}px`,
                      resize: "none",
                      border: "none",
                      overflowY: "hidden",
                      borderBottom: "1px solid rgb(218, 218, 218)",
                    }}></textarea>
                  <div className='container'>
                    <div>
                      <input
                        type='file'
                        accept='.png,.jpeg, .webp, .jpg'
                        onChange={handleImageUpload}
                        ref={iamgeUploadRef}
                        style={{ display: "none" }}
                      />
                      <button
                        className='btn fas fa-image btn-image'
                        onClick={() => iamgeUploadRef.current.click()}></button>
                    </div>
                  </div>
                  {imageURL ? (
                    <div
                      className='row py-2 mx-1'
                      id='image-preview'
                      style={{
                        maxWidth: "350px",
                      }}>
                      <div className='col-8'>
                        <div
                          className='postHeaderImage shadow-sm'
                          style={{
                            backgroundImage: `url(${imageURL})`,
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
                  ) : null}

                  <div className='mx-3 my-3'>
                    <strong>Extra Data:</strong>
                  </div>

                  <textarea
                    className='form-control extraDataContainer'
                    ref={extraDataArea}
                    onChange={handleExtraDataChange}
                    value={extraData}
                    style={{
                      height: `${extraDataScroll}px`,
                      resize: "none",
                      border: "none",
                      overflowY: "hidden",
                    }}></textarea>
                </div>
                <div className='container my-2 d-flex flex-row-reverse'>
                  <button
                    className={`btn  btn-primary  ${
                      isPosting ? "disabled" : null
                    }`}
                    onClick={updatePost}>
                    {isPosting ? (
                      <>
                        <span
                          className='spinner-border spinner-border-sm'
                          role='status'
                          aria-hidden='true'></span>
                        &#160;
                        <span className=''>Updating Post..</span>
                      </>
                    ) : (
                      " Update Post"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className=' d-flex  justify-content-center'>
              <div className='alert alert-warning'>
                <strong>You are not the poster of the given post! </strong>
              </div>
            </div>
          )
        ) : null}
      </div>
    </>
  );
}
