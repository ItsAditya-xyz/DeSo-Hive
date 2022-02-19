import React, { useState, useEffect } from "react";
import ComposeBar from "../WritePad/ComposeBar";
import MassFollow from "../MassFollow/MassFollow";
import MassUnfollow from "../MassFollow/MassUnfollow";
import "./first.css";
import MassSell from "../CreatorCoins/MassSell";
import DerivedKey from "../DerivedKeyManager/DerivedKey";
import EditPost from "../Posts/EditPost";
//import "./sideBarScript.js";
export default function First(props) {
  const [selectedTab, setSelectedTab] = useState("ThreadTab");
  const handleLogOut = () => {
    localStorage.removeItem("identityUsersV2");
    localStorage.removeItem("lastLoggedInUser");
    window.location.reload();
  };
  useEffect(() => {
    try {
      const lastTab = localStorage.getItem("selectedTab").toString();
      setSelectedTab(lastTab);
    } catch (e) {
      console.log(e);
    }
  }, []);
  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    //store tab in local storage
    localStorage.setItem("selectedTab", tab);
    var width = document.documentElement.clientWidth;
    if (width < 1003) {
      document.body.classList.toggle("sb-sidenav-toggled");
    }
  };
  const toggleNavbar = () => {
    document.body.classList.toggle("sb-sidenav-toggled");
  };
  return (
    <>
      <nav className='sb-topnav navbar  navbar-expand navbar-dark bg-dark'>
        <a className='navbar-brand ps-3' href='/'>
          DeSo Hive
        </a>
        <button
          className='btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0'
          id='sidebarToggle'
          onClick={toggleNavbar}
          href='/'>
          <i className='fas fa-bars'></i>
        </button>
        <div className='ms-auto me-0 me-md-3 my-2 my-md-0'></div>
        <div className='ms-auto ms-md-0 me-3 me-lg-'>
          <button
            className='btn btn-primary'
            onClick={handleLogOut}
            style={{ width: "100px" }}>
            Log Out
          </button>
        </div>
        <ul className='navbar-nav ms-auto ms-md-0 me-3 me-lg-4'>
          <li className='nav-item dropdown'>
            <div
              style={{
                backgroundImage: `url(https://diamondapp.com/api/v0/get-single-profile-picture/${props.publicKey}?fallback=https://diamondapp.com/assets/img/default_profile_pic.png)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                marginRight: "10px",
              }}></div>
          </li>
        </ul>
      </nav>
      <div id='layoutSidenav'>
        <div id='layoutSidenav_nav'>
          <nav
            className='sb-sidenav accordion sb-sidenav-dark'
            id='sidenavAccordion'>
            <div className='sb-sidenav-menu'>
              <div className='nav'>
                <div className='sb-sidenav-menu-heading'></div>
                <button
                  className={`nav-link btn ${
                    selectedTab === "ThreadTab" ? "btn-secondary" : ""
                  }`}
                  onClick={() => handleTabChange("ThreadTab")}>
                  <div className='sb-nav-link-icon'>
                    <i className='fas fa-plus'></i>
                  </div>
                  Create Thread
                </button>
                <div className='sb-sidenav-menu-heading'>Followings</div>
                <button
                  className={`nav-link btn ${
                    selectedTab === "FollowTab" ? "btn-secondary" : ""
                  }`}
                  onClick={() => handleTabChange("FollowTab")}>
                  <div className='sb-nav-link-icon'>
                    <i className='fas fa-user'></i>
                  </div>
                  Mass Follow
                </button>

                <button
                  className={`nav-link btn ${
                    selectedTab === "UnFollowTab" ? "btn-secondary" : ""
                  }`}
                  onClick={() => handleTabChange("UnfollowTab")}>
                  <div className='sb-nav-link-icon'>
                    <i className='fas fa-user'></i>
                  </div>
                  Mass Unfollow
                </button>
                <div className='sb-sidenav-menu-heading'>Creator Coins</div>
                <button
                  className={`nav-link btn ${
                    selectedTab === "MassSellTab" ? "btn-secondary" : ""
                  }`}
                  onClick={() => handleTabChange("MassSellTab")}>
                  <div className='sb-nav-link-icon'>
                    <i className='fas fa-coin'></i>
                  </div>
                  Mass Sell
                </button>
                {/* <div className='sb-sidenav-menu-heading'>Miscellaneous</div>
                <button
                  className={`nav-link btn ${
                    selectedTab === "DerivedKeyTab" ? "btn-secondary" : ""
                  }`}
                  onClick={() => handleTabChange("DerivedKeyTab")}>
                  <div className='sb-nav-link-key'>
                    <i className='fas fa-coin'></i>
                  </div>
                  &#160;Derived Key Manger
                </button> */}
                <div className='sb-sidenav-menu-heading'>Posts</div>
                <button
                  className={`nav-link btn ${
                    selectedTab === "editPost" ? "btn-secondary" : ""
                  }`}
                  onClick={() => handleTabChange("editPost")}>
                  <div className='sb-nav-link-key'>
                    <i className='fas fa-pen'></i>
                  </div>
                  &#160;Edit Post
                </button>
              </div>
            </div>
          </nav>
        </div>
        <div id='layoutSidenav_content'>
          {selectedTab === "ThreadTab" ? (
            <ComposeBar
              desoIdentity={props.desoIdentity}
              desoApi={props.desoApi}
              desoPrice={props.desoPrice}
            />
          ) : selectedTab === "FollowTab" ? (
            <MassFollow
              desoIdentity={props.desoIdentity}
              desoApi={props.desoApi}
              desoPrice={props.desoPrice}
            />
          ) : selectedTab === "UnfollowTab" ? (
            <MassUnfollow
              desoIdentity={props.desoIdentity}
              desoApi={props.desoApi}
              desoPrice={props.desoPrice}
            />
          ) : selectedTab === "MassSellTab" ? (
            <MassSell
              desoIdentity={props.desoIdentity}
              desoApi={props.desoApi}
              desoPrice={props.desoPrice}
            />
          ) : selectedTab === "DerivedKeyTab" ? (
            <DerivedKey
              desoIdentity={props.desoIdentity}
              desoApi={props.desoApi}
              appState={props.appState}
            />
          ) : selectedTab === "editPost" ? (
            <EditPost
              desoApi={props.desoApi}
              desoIdentity={props.desoIdentity}
              appState={props.appState}
            />
          ) : null}

          <footer className='py-4 bg-light mt-auto'>
            <div className='container-fluid px-4'>
              <div className='d-flex align-items-center justify-content-between small'>
                <div className='text-muted'>Copyright &copy; DeSoHive 2021</div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
