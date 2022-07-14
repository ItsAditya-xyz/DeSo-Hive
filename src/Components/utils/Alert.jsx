import React from "react";

export default function Alert(props) {
  return (
    <> 
      <div
        className={`alert mt-2  alert-dismissible fade show alert-${props.type}`}
        role='alert'>
        <strong>{`${props.alertBody} `}</strong>  {props.postHashH !== null?<a href = {`https://diamondapp.com/posts/${props.postHash}`} rel="noreferrer" target={'_blank'}>View Post </a>:''}
        <button
          type='button'
          style={{backgroundColor: 'transparent', border: "none", fontSize: "20px", color: "black"}}
          className='close'
          data-dismiss='alert'
          onClick={props.handleCloseAlert}
          aria-label='Close'>
          <span aria-hidden='true'>&times;</span>
        </button>
      </div>
    </>
  );
}
