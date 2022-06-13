import React from "react";
import { useState, useEffect } from "react";
import Deso from "deso-protocol";
import { getExpiration } from "../utils/desoMath";

const deso = new Deso();

export default function DerivedKey(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [derivedKeyMap, setDerivedKeyMap] = useState(null);
  const revokeDerived = async (publicKey) => {
    var loginKey = localStorage.getItem("login_key");
    //window.open(`https://identity.deso.org/publicKey=${loginKey}&derivedPublicKey =${publicKey}&deleteKey=true`);
    const request = {
      publicKey: loginKey,
      derivedPublicKey: publicKey,
      deleteKey: true,
    };
    const response = await deso.identity.getUri
  };
  const handleInit = async () => {
    setIsLoading(true);
    var lastLoggedInUser = localStorage.getItem("login_key");

    const derivedKeysResponse = await props.desoApi.getDerivedKeys(
      lastLoggedInUser
    );

    const derivedMap = derivedKeysResponse.DerivedKeys;
    const validKeys = {};

    const currentBlockHeight = props.appState.BlockHeight;
    for (var key in derivedMap) {
      const isValid = derivedMap[key].IsValid;
      const expirationBlock = derivedMap[key].ExpirationBlock;
      if (isValid && expirationBlock > currentBlockHeight) {
        validKeys[key] = derivedMap[key];
      }
    }
    console.log(validKeys);
    setDerivedKeyMap(validKeys);
    setIsLoading(false);
  };
  useEffect(async () => {
    const test = await handleInit();
  }, []);
  return (
    <>
      {isLoading ? (
        <div className='container my-5'>
          <div className='d-flex justify-content-center'>
            <h1> Loading Derived Keys</h1>&#160;&#160;
            <div
              className='spinner-border'
              style={{ width: "3rem", height: "3rem" }}
              role='status'></div>
          </div>
        </div>
      ) : (
        <div>
          <div className='list-group list-group-flush my-5 container'>
            <div className='d-flex justify-content-center'>
              <h4>
                You are having {Object.keys(derivedKeyMap).length} active
                Derived Keys
              </h4>
            </div>
            {/* Make a yellow alert in booostrap*/}
            <div className='alert alert-warning' role='alert'>
              Warning: Don't revoke keys about whihch you have no idea.
              Otherwise apps like DaoDao, Cordify, Desofy etc. might not work
            </div>
            <div className='d-flex justify-content-center'>
              <p>Current Block Height: {props.appState.BlockHeight}</p>
            </div>
            <table className='table '>
              <thead className='thead-dark'>
                <tr>
                  <th scope='col'>Derived Public key</th>
                  <th scope='col'>Expiration Block</th>
                  <th scope='col'>Time left </th>
                  <th scope='col'></th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(derivedKeyMap).map((publicKey, index) => {
                  return (
                    <tr key={index}>
                      <th scope='row'>
                        <p>{publicKey.slice(0, 15)}...</p>
                      </th>
                      <td>
                        <p>{derivedKeyMap[publicKey].ExpirationBlock}</p>
                      </td>
                      <td>
                        <p>
                          {getExpiration(
                            props.appState.BlockHeight,
                            derivedKeyMap[publicKey].ExpirationBlock
                          )}
                        </p>
                      </td>
                      <td>
                        <button
                          className='btn btn-danger shadow hover-shadow'
                          onClick={() => revokeDerived(publicKey)}>
                          Revoke
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
