import React, { useEffect, useRef } from "react";
import "./WritePad.css";
export default function WritePad(props) {
  useEffect(() => {
    document.getElementById(props.serial).value = props.body;
  });
  console.log(props.body);
  const inputElement = useRef();
  return (
    <>
      <div className='WritePadBoox'>
        <textarea
          onChange={props.handleTextChanges}
          className='form-control textContainer'
          id={props.serial}
          style={{
            resize: "none",
            minHeight: "250px",
            border: "none",
            borderBottom: "1px solid rgb(218, 218, 218)",
          }}></textarea>

        <div className='container'>
          <div className='row'>
            <div className='col-10'>
              <input
                ref={inputElement}
                onChange={props.handleImageUpload}
                type='file'
                accept='.png,.jpeg, .webp, .jpg'
                id={props.serial}
                style={{ display: "none" }}
              />

              <button
                className='btn fas fa-image btn-image'
                onClick={() => inputElement.current.click()}></button>
            </div>
            <div className='col-2'>
              <div className='row'>
                <div className='col-5'>
                  {props.serial === 1 ? (
                    <></>
                  ) : (
                    <button
                      className='btn fas fa-trash btn-delete'
                      onClick={() => {
                        props.handleDeleteComment(props.serial);
                      }}></button>
                  )}
                </div>
                <div className='col-1'>
                  <button
                    className='btn fas fa-plus plus-btn btn-normal'
                    onClick={() => {
                      props.handleAddComment(props.serial);
                    }}></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
