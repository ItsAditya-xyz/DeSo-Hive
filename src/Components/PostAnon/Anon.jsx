import React from "react";
import Deso from "deso-protocol";
import { useState, useEffect } from "react";
import logo from "../../assets/images/logo.svg";
import axios from "axios";
import Alert from "../utils/Alert";
import InfiniteScroll from "react-infinite-scroll-component";
import DesoApi from "../../libs/desoApi";
import Loader from "../utils/Loader";
const deso = new Deso();
const da = new DesoApi();

export default function Anon(props) {
  const [isPosting, setIsPosting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bodyContent, setBodyContent] = useState("");
  const [postHashHex, setPostHashHex] = useState("");
  const [latestPosts, setLatestPosts] = useState(null);
  const [lastPostHashHex, setLastPostHashHex] = useState("");
  const [postLoaded, setPostLoaded] = useState(false);
  const [ticking, setTicking] = useState(true);
  const [tickCount, setTickCount] = useState(0);
  const [captchaUrl, setCaptchaUrl] = useState(
    "https://mintedtweets.cordify.app/get-captcha-image"
  );
  const [wasPostSuccessful, setWasPostSuccessful] = useState(false);

  const [remark, setRemark] = useState("");
  //const [captcha, setCaptcha] = useState(null);
  async function getCaptcha() {}
  const initLatestPost = async () => {
    await getCaptcha();
    try {
      const latestMints = await da.getPostsForPublicKey(
        "AnonVoice",
        "",
        lastPostHashHex,
        20
      );

      setLatestPosts(latestMints["Posts"]);
      setLastPostHashHex(latestMints["LastPostHashHex"]);
      setPostLoaded(true);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(
      () => ticking && setTickCount(tickCount + 1),
      60 * 1e3
    );
    console.log("ticking...");

    setCaptchaUrl(
      captchaUrl === "https://mintedtweets.cordify.app/get-captcha-image2"
        ? "https://mintedtweets.cordify.app/get-captcha-image"
        : "https://mintedtweets.cordify.app/get-captcha-image2"
    );
    return () => clearTimeout(timer);
  }, [tickCount, ticking]);

  var ENGLISH = {};
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 @!#$%^&*()_+-=[]{}|;':,./<>?`~"
    .split("")
    .forEach(function (ch) {
      ENGLISH[ch] = true;
    });

  function stringIsEnglish(str) {
    var index;

    for (index = str.length - 1; index >= 0; --index) {
      if (!ENGLISH[str.substring(index, index + 1)]) {
        return false;
      }
    }
    return true;
  }

  const fetchMoreData = async () => {
    try {
      const morePost = await da.getPostsForPublicKey(
        "AnonVoice",
        "",
        lastPostHashHex,
        20
      );

      setLatestPosts([...latestPosts, ...morePost["Posts"]]);
      setLastPostHashHex(morePost["LastPostHashHex"]);
    } catch (e) {
      console.log(e);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleTextChanges = (e) => {
    setBodyContent(e.target.value);
    //
  };

  const publishPost = async () => {
    const bannedWords = [
      "die",
      "ass",
      "dick",
      "boob",
      "boobs",
      "fuck",
      "fuc*",
      "dickhead",
      "motherfucker",
      "fucker",
      "mofo",
      "semen",
      "pussy",
      "cum",
      "cuckhold",
      "fucked",
      "bitch",
      "fu*k",
      "butt",
      "b00b",
      "coc*",
      "co*k",
      "fart",
      "squirt",
      "creampie",
      "shithole",
    ];

    //check if bodyContent has banned words
    const lowerCaseText = bodyContent.toLowerCase();
    const contains = bannedWords.some((element) => {
      if (lowerCaseText.includes(element)) {
        return true;
      }
      return false;
    });

    if (contains) {
      window.alert(
        "Your post contains a word which is not allowed. Please be humble and nice"
      );
      setIsPosting(false);
      return;
    }
    const isEnglish = stringIsEnglish(bodyContent.trim());
    if (!isEnglish) {
      window.alert("Your post contains non-english characters");
      setIsPosting(false);
      return;
    }

    if (bodyContent.length == 0) {
      alert("Please enter some text to post");
      return;
    }
    setIsPosting(true);

    if (
      new RegExp(
        "([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?"
      ).test(bodyContent)
    ) {
      window.alert(
        "Please do not include links in your post! Only English words are allowed"
      );
      setIsPosting(false);
      return;
    }
    const captchaTextInput = document.getElementById("captchaInput").value;
    if (captchaTextInput === "") {
      window.alert("Please input captcha Text");
      setIsPosting(false);
      return;
    }

    const replacedText = bodyContent.replace(/\$/g, "💲");

    console.log("posted");
    console.log(replacedText);

    const request = {
      content: replacedText,
      captchaText: captchaTextInput,
    };
    axios({
      method: "post",
      url: "https://mintedtweets.cordify.app/post-anonymously",
      data: request,
    })
      .then((res) => {
        const response = res.data;
        setRemark(response.message);
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
  useEffect(async () => {
    await initLatestPost();
  }, []);

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

      <div className=' d-flex justify-content-center m-5 mx-2'>
        <h1 className='text-center'>
          Post anything anonymously through{" "}
          <a href='https://diamondapp.com/u/AnonVoice' target={"_blank"}>
            <span className='text-primary text-underline'>
              <u>@AnonVoice</u>
            </span>
          </a>
        </h1>
      </div>

      <div className='container justify-content-center'>
        <div
          className='alert alert-primary'
          handleCloseAlert={handleCloseModal}>
          <strong>
            {"In order to prevent spams, you can only make on post/hour"}
          </strong>
        </div>
      </div>
      <div className='d-flex justify-content-center'>
        <div className='container my-1 mx-2 py-4 px-4 compose-container'>
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
          <div className='my-3'>
            <img
              src={captchaUrl}
              alt='captcha'
              className='captcha-image'
              style={{ width: "250px" }}
            />
          </div>
          <div className='d-flex'>
            <div className='px-3'>
              <input
                type='text'
                id='captchaInput'
                className='form-control'
                placeholder='Captcha'
              />
            </div>

            <button
              className={`btn btn-primary shadow-sm ${
                isPosting ? "disabled" : " "
              }`}
              style={{ width: "90px" }}
              onClick={publishPost}>
              {isPosting ? <div className='loading'>Posting...</div> : "Post"}
            </button>
          </div>

          <div className='my-1'>{remark}</div>
        </div>
      </div>

      <div className='continer d-flex justify-content-center m-5 mx-2'>
        <h2 className='compose-heading'> Latest Anonymous Posts</h2>
      </div>

      {postLoaded ? (
        <div className='container my-2 d-flex justify-content-center'>
          <InfiniteScroll
            className='container mx-auto flex pt-4 pb-12 '
            dataLength={latestPosts.length}
            next={fetchMoreData}
            hasMore={true}
            loader={
              <div className='d-flex justify-content-center'>
                <div
                  className='d-flex justify-content-center'
                  style={{ marginBottom: "80px" }}>
                  <div
                    className='spinner-border text-primary'
                    style={{ width: "4rem", height: "4rem" }}
                    role='status'>
                    <span className='sr-only'>Loading...</span>
                  </div>
                </div>
              </div>
            }>
            {latestPosts.map((post, index) => {
              return (
                <a
                  target={"_blank"}
                  href={`https://diamondapp.com/posts/${post.PostHashHex}`}
                  className='container d-flex flex-column  mx-2  shadow-sm p-4 mb-3 bg-white '
                  style={{
                    borderRadius: "10px",
                    maxWidth: "600px",
                    color: "black",
                    textDecoration: "none",
                  }}
                  key={index}>
                  <div>
                    <div className='text-lg mb-2 overflow-hidden break-all '>
                      <p style={{ fontSize: "19px" }}>{post.Body}</p>
                    </div>
                  </div>

                  <div className='container d-flex justify-content-around mt-4'>
                    <div className='d-flex justify-content-center'>
                      <div className='sb-nav-link-key'>
                        <i
                          className='fas fa-heart '
                          style={{ color: "red" }}></i>
                      </div>
                      <div className='mx-1'> &#160;{post.LikeCount}</div>
                    </div>
                    <div className='d-flex justify-content-center'>
                      <div className='sb-nav-link-key'>
                        <i
                          className='fas fa-retweet '
                          style={{ color: "#41B07D" }}></i>
                      </div>
                      &#160; {post.RepostCount + post.QuoteRepostCount}
                    </div>
                    <div className='d-flex justify-content-center'>
                      <div className='sb-nav-link-key'>
                        <i
                          className='fas fa-comment '
                          style={{ color: "#B6B6B6" }}></i>
                      </div>
                      <div className='mx-1'>{post.CommentCount}</div>
                    </div>
                  </div>
                </a>
              );
            })}
          </InfiniteScroll>
        </div>
      ) : (
        <div className='d-flex justify-content-center'>
          <div
            className='d-flex justify-content-center'
            style={{ marginBottom: "80px" }}>
            <div
              className='spinner-border text-primary'
              style={{ width: "4rem", height: "4rem" }}
              role='status'>
              <span className='sr-only'>Loading...</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
