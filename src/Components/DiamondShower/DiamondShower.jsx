import React, { useState } from "react";
import Deso from "deso-protocol";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect } from "react";
import Loader from "../utils/Loader";
const deso = new Deso();
// the worst thing about this part rn is that desoJS don't resolve the follow function if it causes 404
export default function DiamondShower(props) {
  const [searchingProfile, setSearchingProfile] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [latestPosts, setLatestPosts] = useState([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [lastPostHashHex, setLastPostHashHex] = useState("");
  const [isDimaonding, setIsDiamonding] = useState(false);
  const [diamondLevel, setDiamondLevel] = useState("1");
  const [userHasPosts, setUserHasPosts] = useState(false);
  const [postsToDiamondCount, setPostsToDiamondCount] = useState(50);
  const [userPublicKey, setUserPublicKey] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [postsDiamonded, setPostsDiamonded] = useState(0);
  const diamondLevelMap = {
    1: 0.00005,
    2: 0.0005,
    3: 0.005,
  };

  useEffect(() => {
    var lastLoggedInUser = localStorage.getItem("deso_user_key").toString();
    setUserPublicKey(lastLoggedInUser);
  }, []);
  const handlePostFind = async () => {
    setSearchingProfile(true);
    try {
      const username = document.getElementById("followingSearch").value;
      setUsernameInput(username);
      const userPosts = await props.desoApi.getPostsForPublicKey(
        username,
        "",
        lastPostHashHex,
        50,
        userPublicKey
      );
      if (!userPosts) {
        alert("User not found");
        setSearchingProfile(false);
        return;
      }
      if (userPosts["Posts"].length > 0) {
        setUserHasPosts(true);
      }
      setLatestPosts(userPosts["Posts"]);
      setLastPostHashHex(userPosts["LastPostHashHex"]);
      setSearchingProfile(false);
      setPostsLoaded(true);

      setTotalCost(postsToDiamondCount * diamondLevelMap[diamondLevel]);
    } catch (e) {
      console.log(e);
      setSearchingProfile(false);
    }
  };
  const fetchMoreData = async () => {
    try {
      const morePost = await props.desoApi.getPostsForPublicKey(
        usernameInput,
        "",
        lastPostHashHex,
        20,
        userPublicKey
      );

      setLatestPosts([...latestPosts, ...morePost["Posts"]]);
      setLastPostHashHex(morePost["LastPostHashHex"]);
    } catch (e) {
      console.log(e);
    }
  };

  const handlePostsToDiamondCountChange = (e) => {
    setPostsToDiamondCount(e.target.value);
    setTotalCost(parseInt(e.target.value) * diamondLevelMap[diamondLevel]);
  };
  const handleDiamondShower = async () => {
    setIsDiamonding(true);
    let totalPostDiamonded = 0;
    for (let i = 0; i < latestPosts.length; i++) {
      if (postsToDiamondCount == totalPostDiamonded) {
        break;
      }
      const postHashHex = latestPosts[i].PostHashHex;
      const hasDiamondGiven =
        latestPosts[i].PostEntryReaderState.DiamondLevelBestowed;

      if (!hasDiamondGiven) {
        try {
          const request = {
            ReceiverPublicKeyBase58Check:
              latestPosts[i].PosterPublicKeyBase58Check,
            SenderPublicKeyBase58Check: userPublicKey,
            DiamondPostHashHex: postHashHex,
            DiamondLevel: parseInt(diamondLevel),
            MinFeeRateNanosPerKB: 1000,
            InTutorial: false,
          };
          const response = await deso.social.sendDiamonds(request);
          //increment postsDiamonded
          totalPostDiamonded += 1;
          setPostsDiamonded(totalPostDiamonded);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (e) {
          console.log(e);
        }
      }
    }
    setIsDiamonding(false);
    if (totalPostDiamonded < 10) {
      window.alert(
        `Diamonds sent to ${totalPostDiamonded} posts. Mostly new posts are diamonded by you. Scroll down the whole page first and then click diamond shower button to diamond older posts.`
      );
    } else {
      window.alert(`Diamonds sent to ${totalPostDiamonded} posts`);
    }
  };
  const handleFilter = () => {
    if (isDimaonding) return;
    const filterValue = document.getElementById("diamondLevelFilter").value;
    setTotalCost(parseInt(postsToDiamondCount) * diamondLevelMap[filterValue]);
    setDiamondLevel(filterValue);
  };
  const handleStopButton = () => {
    //reload the page
    window.location.reload();
  };
  return (
    <>
      <div className='container my-5'>
        <h3 className='text-center'>
          Search the DeSo username on whom you want to shower Diamonds
        </h3>
        <div className=' d-flex  justify-content-center'>
          <div className='input-group mb-3 my-4 searchBox '>
            <div className='input-group-prepend'>
              <span className='input-group-text' id='basic-addon1'>
                @
              </span>
            </div>
            <input
              type='text'
              className='form-control'
              placeholder='Username'
              aria-label='Username'
              aria-describedby='basic-addon1'
              id='followingSearch'
            />
            <div className='input-group-append'>
              <button
                className={`btn  btn-primary  ${
                  searchingProfile ? "disabled" : null
                }`}
                type='button'
                onClick={handlePostFind}>
                {searchingProfile ? (
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
        {postsLoaded && userHasPosts ? (
          <>
            {" "}
            <div className='continer d-flex justify-content-center align-items-center ml-auto mx-2 flex-column'>
              <div className='d-flex align-items-center mx-2 my-2'>
                <label htmlFor='filters'>Number of Posts to diamond</label>
                <input
                  type='number'
                  id='diamondLevel'
                  onChange={handlePostsToDiamondCountChange}
                  value={postsToDiamondCount}
                  className='mx-2 form-control'
                />
              </div>
              <div className='my-2'>
                <label htmlFor='filters'>Diamond Level: </label>
                <select
                  name='coin filter'
                  id='diamondLevelFilter'
                  onChange={handleFilter}>
                  <option value='1'>{`💎`}</option>
                  <option value='2'>{`💎💎`}</option>
                  <option value='3'>{`💎💎💎`}</option>
                </select>
              </div>
              <div className='my-2'>
                <button
                  className={`btn my-2 btn-primary btn-lg shadow-lg ${
                    isDimaonding ? "disabled" : null
                  }`}
                  onClick={handleDiamondShower}>
                  {isDimaonding ? (
                    <>
                      <span
                        className='spinner-border spinner-border-sm'
                        role='status'
                        aria-hidden='true'></span>
                      &#160;
                      <span className=''>
                        Diamonding {postsDiamonded}/{postsToDiamondCount} Posts
                      </span>
                    </>
                  ) : (
                    `Shower Diamonds on ${postsToDiamondCount} Posts`
                  )}
                </button>
              </div>
              <p>
                Total Cost: {totalCost} $DESO (~$
                {(props.desoPrice / 100) * totalCost})
              </p>
              {isDimaonding ? (
                <button
                  className='btn btn-danger btn-md my-1'
                  onClick={handleStopButton}>
                  Stop
                </button>
              ) : null}
            </div>
            <div className='continer d-flex justify-content-center my-1 mx-2'>
              <h3 className='compose-heading'>{`Latest Posts by ${usernameInput}`}</h3>
            </div>
            <div className='container my-2 d-flex justify-content-center '>
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
                      className='container d-flex flex-column  shadow-sm py-4 mb-3 bg-white '
                      style={{
                        borderRadius: "10px",
                        maxWidth: "600px",
                        color: "black",
                        textDecoration: "none",
                      }}
                      key={index}>
                      <div className='container'>
                        <div className='container text-lg mb-2 overflow-hidden break-all '>
                          <p className='text-wrap text-justify text-truncate text-break'>
                            {post.Body}
                          </p>
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
                        <div className='d-flex justify-content-center'>
                          <div className='sb-nav-link-key'>
                            <i
                              className='fas fa-gem '
                              style={{
                                color:
                                  post.PostEntryReaderState
                                    .DiamondLevelBestowed == 0
                                    ? "black"
                                    : "blue",
                              }}></i>
                          </div>
                          <div className='mx-1'>{post.DiamondCount}</div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </InfiniteScroll>
            </div>
          </>
        ) : usernameInput !== "" && !searchingProfile && !userHasPosts ? (
          <div className='text-center'>No posts found</div>
        ) : null}
      </div>
    </>
  );
}
