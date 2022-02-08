import React, { useState, useEffect } from "react";
import "./massFollow.css";

export default function MassUnfollow(props) {
  const [loadingFollowings, setIsLoadingFollowings] = useState(true);
  const [listOfFollowings, setListOfFollowings] = useState([]);
  const [numOfFollowings, setNumOfFollowings] = useState(0);
  const [PublicKeyToProfileEntryMap, setPublicKeyToProfileEntryMap] =
    useState(null);
  const [totalUnfollowed, setTotalUnfollowed] = useState(0);
  const [isUnfollowing, setIsUnfollowing] = useState(false);

  const massUnfollowUsers = async () => {
    setIsUnfollowing(true);
    //looping into list of keys to follow
    let unfollowed = 0;
    try {
      var lastLoggedInUser = JSON.parse(
        localStorage.getItem("identityUsersV2")
      ).publicKey.toString();

      for (let i = 0; i < listOfFollowings.length; i++) {
        let key = listOfFollowings[i];
        const followTxn = await props.desoApi.createFollowTxn(
          lastLoggedInUser,
          key,
          false
        );
        const transactionHex = followTxn.TransactionHex;
        const signedTransaction = await props.desoIdentity.signTxAsync(
          transactionHex
        );
        const submitTransaction = await props.desoApi.submitTransaction(
          signedTransaction
        );
        unfollowed += 1;
        setTotalUnfollowed(unfollowed);
        //remove key from PublicKeyToProfileEntryMap

        console.log(totalUnfollowed);
      }
    } catch (e) {
      console.log(e);
      alert("Something went wrong. Please retry");
    }
    alert(`You have successfully Unfollowed ${unfollowed} users!`);
    window.location.reload();
  };
  //get last logged in user from local storage
  const handleInit = async () => {
    var lastLoggedInUser = JSON.parse(
      localStorage.getItem("identityUsersV2")
    ).publicKey.toString();

    const getFollowStateless = await props.desoApi.getFollowsStateless(
      "",
      true,
      10000,
      lastLoggedInUser
    );
    console.log(getFollowStateless);
    setNumOfFollowings(getFollowStateless.NumFollowers);
    const PublicKeyToProfileEntry = getFollowStateless.PublicKeyToProfileEntry;
    const listOfKeys = Object.keys(PublicKeyToProfileEntry);
    setListOfFollowings(listOfKeys);
    setPublicKeyToProfileEntryMap(PublicKeyToProfileEntry);
    setIsLoadingFollowings(false);
  };
  const handleCheckboxChange = (publicKey, index) => {
    if (isUnfollowing) {
      return;
    }
    const checValue = document.getElementById(
      `flexCheckDefault-${index}`
    ).checked;
    if (checValue) {
      setListOfFollowings([...listOfFollowings, publicKey]);
    } else {
      setListOfFollowings(listOfFollowings.filter((key) => key !== publicKey));
    }
  };
  useEffect(() => {
    const test = handleInit();
  }, []);

  return (
    <>
      {loadingFollowings ? (
        <div className='container my-5'>
          <div className='d-flex justify-content-center'>
            <h1> Loading your followings</h1>&#160;&#160;
            <div
              className='spinner-border'
              style={{width: '3rem', height: '3rem'}}
              role='status'>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className='list-group list-group-flush my-4'>
            <div className='d-flex justify-content-center'>
              <h4>You are following {numOfFollowings} users</h4>
            </div>
            <div className='d-flex justify-content-center my-2'>
              <button
                className={`btn btn-primary btn-lg ${
                  isUnfollowing ? "disabled" : null
                }`}
                onClick={() => {
                  massUnfollowUsers();
                }}>
                {isUnfollowing ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm'
                      role='status'
                      aria-hidden='true'></span>
                    &#160;
                    <span className=''>
                      Unfollowing {listOfFollowings.length} users
                    </span>
                  </>
                ) : (
                  `Unfollow all ${listOfFollowings.length} users`
                )}
              </button>
            </div>
            {totalUnfollowed > 0 ? (
              <div className='d-flex justify-content-center my-2'>
                <h4>
                  {totalUnfollowed}/{listOfFollowings.length} users Unfollowed
                </h4>
              </div>
            ) : null}
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
                              {PublicKeyToProfileEntryMap[publicKey].Username}
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
        </div>
      )}
    </>
  );
}
