import React from "react";
import "./Landing.css";
import doodles from "../../assets/images/doodles.svg";
import upDoodles from "../../assets/images/up-doodles.svg";
import logo from "../../assets/images/logo.svg";
export default function Landing(props) {
  return (
    <>
      <div
        className='bodybg'
        style={{
          backgroundImage: `url(${doodles})`,
          position: "fixed",
          width: "120%",
          height: "100%",
          left: "0",
          right: "0",
          zIndex: "-2",
          display: "block",
          backgroundPosition: "center",
          backgroundSize: "50%",
          filter: "opacity(0.05)",
        }}></div>

      <div
        className='bodybg'
        style={{
          backgroundImage: `url(${upDoodles})`,
          position: "fixed",
          width: "50%",
          height: "160%",
          left: "480px",
          right: "0",
          zIndex: "-2",
          display: "block",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "50%",
          filter: "opacity(0.05)",
        }}></div>

      {/*<nav className='navbar navbar-expand-lg navbar-dark bg-dark navbar-top'>
        <div className='container-fluid'>
          <button
            className='navbar-toggler'
            type='button'
            data-bs-toggle='collapse'
            data-bs-target='#navbarSupportedContent'
            aria-controls='navbarSupportedContent'
            aria-expanded='false'
            aria-label='Toggle navigation'>
            <span className='navbar-toggler-icon'></span>
          </button>
          <div className='collapse navbar-collapse' id='navbarSupportedContent'>
            <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
              <li className='nav-item'>
                <a
                  className='nav-link active navbar-brand'
                  aria-current='page'
                  href='/'>
                  DeSo Hive
                </a>
              </li>
            </ul>
            <div className='d-flex'>
              <button className='btn btn-primary' onClick={props.loginWithDeso}>
                Login with Identity
              </button>
            </div>
          </div>
        </div>
      </nav>  */}

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

          <div className='nav navbar-nav navbar-right align-self-center '>
            <button
              className='btn btn-primary btn-sm'
              onClick={props.loginWithDeso}>
              Login with Identity
            </button>
          </div>
        </div>
      </nav>

      <div className='container-fluid front-container '>
        <h1>
          Interact with
          <span className='text-primary'> DeSo</span> blockchain like never
          before!
        </h1>
        <div className='sub'>
          <p>
            <strong>DeSo Hive</strong> is the starter pack for DeSo creators
            enabling users to write rich content threads, edit posts and manage
            their wallets and followings
          </p>

          <div className='get-started'>
            <button
              className='btn btn-lg btn-primary shadow'
              style={{ minWidth: "220px", minHeight: "65px" }}
              onClick={props.loginWithDeso}>
              Get Started
            </button>
          </div>
          <br />
          <br />
        </div>
      </div>
 
    </>
  );
}
