import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import logo from "../../assets/images/logo.svg";
import Deso from "deso-protocol";
import Loader from "../utils/Loader";
function View(props) {
  const deso = new Deso();
  const params = useParams();
  const postHashHex = params.postHashHex;
  const [loggedInPublicKey, setLoggedInPublicKey] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [singlePostInfo, setSinglePostInfo] = useState(null);
  const [decryptedContent, setDecryptedContent] = useState(null);
  const [currentJWT, setCurrentJWT] = useState(null);
  const [contentLoaded, setContedLoaded] = useState(false);

  const [lackDiamonds, setLackDiamonds] = useState(false);
  const [diamondLevelGated, setDiamondLevelGated] = useState(0);
  const [imageURL, setImageURL] = useState(null);
  const [diamondLevelMap, setDiamondLevelMap] = useState({
    1: "$0.01",
    2: "$0.01",
    3: "$0.05",
    4: "$0.45",
    5: "$5",
    6: "$45",
  });
  const handleLogin = async () => {
    const request = 3;
    const response = await deso.identity.login(request);
    console.log(response);
    if (response) {
      localStorage.setItem("loggedInPublicKey", response.key);
      setLoggedInPublicKey(response.key);
      window.location.reload();
    }
  };

  const handleDiamond = async () => {
    const request = {
      ReceiverPublicKeyBase58Check:
        singlePostInfo.ProfileEntryResponse.PublicKeyBase58Check,
      SenderPublicKeyBase58Check: loggedInPublicKey,
      DiamondPostHashHex: postHashHex,
      DiamondLevel: diamondLevelGated,
      MinFeeRateNanosPerKB: 1000,
      InTutorial: false,
    };
    const response = await deso.social.sendDiamonds(request);
    console.log(response);
    window.location.reload();
  };
  useEffect(() => {

    async function getSinglePostInfo(postHashHex) {
      setIsLoading(true);

      const PostRequest = {
        PostHashHex: postHashHex,
        ReaderPublicKeyBase58Check: loggedInPublicKey,
      };
      const postResponse = await deso.posts.getSinglePost(PostRequest);
      setSinglePostInfo(postResponse.PostFound);
      const postExtraData = postResponse.PostFound.PostExtraData;
      const dimaondGatedCount = parseInt(postExtraData.gatedDiamondLevel);
      setDiamondLevelGated(dimaondGatedCount);
      const diamondGiven =
        postResponse.PostFound.PostEntryReaderState.DiamondLevelBestowed;

      if (dimaondGatedCount > diamondGiven) {
        setLackDiamonds(true);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);

    }
    const loggedInPublicKey = localStorage.getItem("loggedInPublicKey");
    if (loggedInPublicKey) {
      setLoggedInPublicKey(loggedInPublicKey);
    }
    if (params.postHashHex && params.postHashHex.length === 64) {
      if (isLoading) return;

      console.log(params.postHashHex);
      getSinglePostInfo(postHashHex);
    }
  }, [params]);

  const handleJWT = async () => {
    setContedLoaded(false);
    const jwtToken = await deso.identity.getJwt(undefined);
    setCurrentJWT(jwtToken);

    const decryptRequest = {
      content: singlePostInfo.PostExtraData.EncryptedData,
      jwt: jwtToken,
      postHashHex: postHashHex,
      readerPublicKey: loggedInPublicKey,
    };
    const fetchURL = "https://mintedtweets.cordify.app/return-decrypted-data";
    //const fetchURL = "http://127.0.0.1:5000/return-decrypted-data"
    const response = await fetch(fetchURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(decryptRequest),
    });

    const data = await response.json();

    if (data) {
      console.log(data.response.content);
      setDecryptedContent(data.response.content);
      setImageURL(data.response.image);
      setContedLoaded(true);
    }

  };
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
            <a className='btn btn-primary btn-sm mx-2' href='/diamondToView'>
              Create Gated Post
            </a>
            {!loggedInPublicKey && (
              <button className='btn btn-primary btn-sm' onClick={handleLogin}>
                Log In With DeSo
              </button>
            )}
            {loggedInPublicKey && (
              <img
                src={`https://diamondapp.com/api/v0/get-single-profile-picture/${loggedInPublicKey}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                alt=''
                width='40'
                height='40'
                style={{ borderRadius: "50%" }}
                className='d-inline-block align-text-top'></img>
            )}
            {loggedInPublicKey && (
              <button
                className='btn btn-primary btn-sm'
                onClick={() => {
                  localStorage.removeItem("loggedInPublicKey");
                  setLoggedInPublicKey("");
                }}>
                Log Out
              </button>
            )}

          </div>
        </div>
      </nav>
      {isLoading ? <div className='d-flex justify-content-center'>
        <div className='spinner-border' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div> : <>

        {!loggedInPublicKey && (
          <div className='container-fluid front-container '>
            <h1>
              You need to login with
              <span className='text-primary'> DeSo </span> to see the content
            </h1>
            <div className='sub'>
              <p>
                <strong>Diamond To View</strong> enables users to create content
                and gate it behind a DeSo Diamond with simple to use UI
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

        {loggedInPublicKey && !currentJWT && (!lackDiamonds || singlePostInfo.PosterPublicKeyBase58Check === loggedInPublicKey || loggedInPublicKey === "BC1YLhBLE1834FBJbQ9JU23JbPanNYMkUsdpJZrFVqNGsCe7YadYiUg") && (
          <div className='container-fluid front-container '>
            <button className='btn btn-primary btn-sm' onClick={handleJWT}>
              View Post
            </button>
          </div>
        )}

        {decryptedContent && (!lackDiamonds || singlePostInfo.PosterPublicKeyBase58Check === loggedInPublicKey || loggedInPublicKey === "BC1YLhBLE1834FBJbQ9JU23JbPanNYMkUsdpJZrFVqNGsCe7YadYiUg") && loggedInPublicKey && (
          <div
            className='container-fluid front-container shadow p-3 mb-5 bg-white rounded'
            style={{
              borderRadius: "10px",
              maxWidth: "600px",
              color: "black",
              textDecoration: "none",
            }}>
            <div className='d-flex '>
              <img
                src={`https://diamondapp.com/api/v0/get-single-profile-picture/${singlePostInfo.ProfileEntryResponse.PublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                alt=''
                width='40'
                height='40'
                style={{ borderRadius: "50%" }}
                className='d-inline-block align-text-top'></img>
              <p
                className='text-lg mx-1'
                style={{
                  fontSize: "20px",
                }}>
                {singlePostInfo.ProfileEntryResponse.Username}
              </p>
            </div>
            <div className='text-lg mb-2 overflow-hidden break-all my-2'>
              <p style={{ fontSize: "19px" }}>{decryptedContent}</p>
              {imageURL && <img src={imageURL} style={{ maxWidth: "100%" }} />}
            </div>
            <div className='container d-flex justify-content-around mt-4'>
              <div className='d-flex justify-content-center'>
                <div className='sb-nav-link-key'>
                  <i className='fas fa-heart ' style={{ color: "red" }}></i>
                </div>
                <div className='mx-1'> &#160;{singlePostInfo.LikeCount}</div>
              </div>
              <div className='d-flex justify-content-center'>
                <div className='sb-nav-link-key'>
                  <i className='fas fa-retweet ' style={{ color: "#41B07D" }}></i>
                </div>
                &#160;{" "}
                {singlePostInfo.RepostCount + singlePostInfo.QuoteRepostCount}
              </div>
              <div className='d-flex justify-content-center'>
                <div className='sb-nav-link-key'>
                  <i className='fas fa-comment ' style={{ color: "#B6B6B6" }}></i>
                </div>
                <div className='mx-1'>{singlePostInfo.CommentCount}</div>
              </div>
            </div>
          </div>
        )}

        {(lackDiamonds && singlePostInfo.PosterPublicKeyBase58Check !== loggedInPublicKey) && loggedInPublicKey && (
          <div className='container-fluid front-container '>
            <h1
              style={{
                fontSize: "30px",
              }}>
              {`You need to give at least ${diamondLevelGated} Diamond to view the content`}
            </h1>
            <div>
              <button
                className='btn btn-primary btn-sm'
                onClick={
                  handleDiamond
                }>{`Give ${diamondLevelGated} diamonds`}</button>
            </div>
            <p className='my-3'>
              Diamonding might not work. Please give diamond to the post on
              DiamondApp till we fix this
            </p>
          </div>
        )}</>}
    </div>
  );
}

export default View;
