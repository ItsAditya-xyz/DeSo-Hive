import { map } from "jquery";
import React from "react";
import { useState, useEffect } from "react";
import sha256 from "sha256";
import bs58check from "bs58check";
import { getExpiration, uint64ToBufBigEndian, getPublicKeyfromDeSoPublicKey } from "../utils/desoMath";

export default function DerivedKey(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [derivedKeyMap, setDerivedKeyMap] = useState(null);
  const revokeDerived = async (publicKey, expirationBlock) => {
    try {
      var lastLoggedInUser = JSON.parse(
        localStorage.getItem("identityUsersV2")
      ).publicKey.toString();
        
      const derivedPublicKey = getPublicKeyfromDeSoPublicKey(publicKey)
      //const derivedPublicKeyBuffer = bs58check.decode(publicKey)
      const expirationBlockBuffer = uint64ToBufBigEndian(expirationBlock);
      console.log(derivedPublicKey);
      var accessSignature = sha256.x2(derivedPublicKey, expirationBlockBuffer);
      console.log(accessSignature);
      const deAuthResponse = await props.desoApi.deAuthDerivedKey(
        lastLoggedInUser,
        publicKey,
        expirationBlock,
        accessSignature
      );
      console.log(deAuthResponse);
    } catch (e) {
      console.log(e);
    }
  };
  const handleInit = async () => {
    setIsLoading(true);
    var lastLoggedInUser = JSON.parse(
      localStorage.getItem("identityUsersV2")
    ).publicKey.toString();

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
                          className='btn btn-danger shadow'
                          onClick={() =>
                            revokeDerived(
                              publicKey,
                              derivedKeyMap[publicKey].ExpirationBlock
                            )
                          }>
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
