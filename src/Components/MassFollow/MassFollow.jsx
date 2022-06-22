import React, { useState } from "react";
import Deso from "deso-protocol";
const deso = new Deso();

// the worst thing about this part rn is that desoJS don't resolve the follow function if it causes 404
export default function MassFollow(props) {
  const [PublicKeyToProfileEntryMap, setPublicKeyToProfileEntryMap] =
    useState(null);

  const [listOfKeysToFollow, setListOfKeysToFollow] = useState([]);
  const [searchingProfile, setSearchingProfile] = useState(false);
  const [following, setFollowing] = useState(0);

  const [isFollowing, setIsFollowing] = useState(false);
  const [totalFollowed, setTotalFollowed] = useState(0);

  const handleFollowingSearch = async () => {
    setSearchingProfile(true);
    setPublicKeyToProfileEntryMap(null);
    try {
      const username = document.getElementById("followingSearch").value;
      const getFollowStateless = await deso.social.getFollowsStateless({
        Username: username,
        numToFetch: 10000,
        GetEntriesFollowingUsername: false,
      });

      const NumOfFollowings = getFollowStateless.NumFollowers;
      setFollowing(NumOfFollowings);
      const PublicKeyToProfileEntry =
        getFollowStateless.PublicKeyToProfileEntry;
      //sort PublicKeyToProfileEntry by CoinPriceDeSoNanos
      const sortedPublicKeyToProfileEntry = {};
      Object.keys(PublicKeyToProfileEntry)
        .sort(function (a, b) {
          return (
            PublicKeyToProfileEntry[b].CoinPriceDeSoNanos -
            PublicKeyToProfileEntry[a].CoinPriceDeSoNanos
          );
        })
        .forEach(function (key) {
          sortedPublicKeyToProfileEntry[key] = PublicKeyToProfileEntry[key];
        });

      //get all publicKey from PublicKeyToProfileEntry
      const listOfKeys = Object.keys(sortedPublicKeyToProfileEntry);
      setListOfKeysToFollow(listOfKeys);
      setPublicKeyToProfileEntryMap(sortedPublicKeyToProfileEntry);
      //const listOfPublicKeys = getFollowStateless.
    } catch (e) {
      setPublicKeyToProfileEntryMap(null);
      alert("Oops...Something went wrong. Make sure username exists");
      setSearchingProfile(false);
      console.log(e);
    }
    setSearchingProfile(false);
    setIsFollowing(false);
  };

  const handleCheckboxChange = (publicKey, index) => {
    if (isFollowing) {
      return;
    }
    const checValue = document.getElementById(
      `flexCheckDefault-${index}`
    ).checked;
    if (checValue) {
      setListOfKeysToFollow([...listOfKeysToFollow, publicKey]);
    } else {
      setListOfKeysToFollow(
        listOfKeysToFollow.filter((key) => key !== publicKey)
      );
    }
  };

  const massFollowUsers = async () => {
    setIsFollowing(true);
    let followed = 0;
    //looping into list of keys to follow
    try {
      var lastLoggedInUser = localStorage.getItem("deso_user_key").toString();

      for (let i = 0; i < listOfKeysToFollow.length; i++) {
        let key = listOfKeysToFollow[i];
        try {
          const followTxn = await deso.social.createFollowTxnStateless({
            IsUnfollow: false,
            FollowedPublicKeyBase58Check: key,
            FollowerPublicKeyBase58Check: lastLoggedInUser,
          });
          console.log(followTxn)
          if (followTxn) {
            followed += 1;
            setTotalFollowed(followed);
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (e) {
          console.log(e);
          console.log("kuch to hua")
          // get back to the loop
          continue;
        }
      }
    } catch (e) {
      console.log(e);
      alert("Something went wrong. Please retry");
    }
    alert(`You have successfully followed ${followed} users!`);
    window.location.reload();
  };
  return (
    <>
      <div className='container my-5'>
        <h3 className='text-center'>
          Search the DeSo username whose followings you want to follow!
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
                  searchingProfile || isFollowing ? "disabled" : null
                }`}
                type='button'
                onClick={handleFollowingSearch}>
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
        {totalFollowed > 0 ? (
          <div className='d-flex justify-content-center my-2'>
            <h4>
              {totalFollowed}/{listOfKeysToFollow.length} users followed
            </h4>
          </div>
        ) : null}
        {PublicKeyToProfileEntryMap ? (
          <div className='list-group list-group-flush my-4'>
            <div className='d-flex justify-content-center'>
              <h4>
                <strong>
                  {document.getElementById("followingSearch").value}
                </strong>
                &#160;is following {following} users
              </h4>
            </div>
            <div className='d-flex justify-content-center my-2'>
              <button
                className={`btn  btn-primary btn-lg ${
                  isFollowing ? "disabled" : null
                }`}
                onClick={() => {
                  massFollowUsers();
                }}>
                {isFollowing ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm'
                      role='status'
                      aria-hidden='true'></span>
                    &#160;
                    <span className=''>
                      Following {listOfKeysToFollow.length} users
                    </span>
                  </>
                ) : (
                  `Follow all ${listOfKeysToFollow.length} users`
                )}
              </button>
            </div>

            {Object.keys(PublicKeyToProfileEntryMap).map((publicKey, index) => {
              return (
                <div className='list-group-item my-1' key={index}>
                  <div>
                    <div className='form-check'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        value=''
                        id={`flexCheckDefault-${index}`}
                        defaultChecked
                        onChange={() => {
                          handleCheckboxChange(
                            PublicKeyToProfileEntryMap[publicKey]
                              .PublicKeyBase58Check,
                            index
                          );
                        }}
                      />
                    </div>
                    <div
                      className='card-body container '
                      style={{ overflow: "hidden" }}>
                      <div className='d-flex justify-content-between'>
                        <div className='d-flex align-items-center'>
                          <img
                            src={`https://diamondapp.com/api/v0/get-single-profile-picture/${PublicKeyToProfileEntryMap[publicKey].PublicKeyBase58Check}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png`}
                            className='rounded-circle'
                            alt='profile'
                            width='50'
                            height='50'
                          />
                          <h5 className='mx-2 card-title'>
                            <strong>
                              {" "}
                              {
                                PublicKeyToProfileEntryMap[publicKey].Username
                              }{" "}
                            </strong>
                            {PublicKeyToProfileEntryMap[publicKey]
                              .IsVerified ? (
                              <span
                                style={{ color: "blue" }}
                                className='fas fa-check-circle'></span>
                            ) : null}
                          </h5>
                        </div>
                      </div>

                      <p className='card-text' style={{ fontSize: "18px" }}>
                        {PublicKeyToProfileEntryMap[publicKey].Description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}
