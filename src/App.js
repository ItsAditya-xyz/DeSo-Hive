import "./App.css";
import First from "./Components/First/First";
import DeSoIdentity from "./libs/desoIdentity";
import DesoApi from "./libs/desoApi";
import Landing from "./Components/Landing/Landing";
import { useEffect, useState } from "react";
const IdentityUsersKey = "identityUsersV2";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [desoIdentity, setDesoIdentity] = useState(null);
  const [desoApi, setDesoApi] = useState(null);
  const [publicKey, setPublicKey] = useState(null);

  useEffect(() => {
    const di = new DeSoIdentity();
    setDesoIdentity(di);
 
    const da = new DesoApi();
    setDesoApi(da);
    let user = {};
    if (localStorage.getItem(IdentityUsersKey) === "undefined") {
      user = {};
    } else if (localStorage.getItem(IdentityUsersKey)) {
      user = JSON.parse(localStorage.getItem(IdentityUsersKey) || "{}");
    }

    if (user.publicKey) {
      setLoggedIn(true);
      setPublicKey(user.publicKey);
      localStorage.setItem("lastLoggedInUser", `${user.publicKey.toString()}`);
    }
  }, []);

  const loginWithDeso = async () => {
    const user = await desoIdentity.loginAsync(4);

    setLoggedIn(true);
    //console.log(user)
    setPublicKey(user.publicKey);
    //store user.publicKey as string in localstorage

    localStorage.setItem("lastLoggedInUser", `${user.publicKey.toString()}`);
  };

  return (
    <>
     <iframe
        title="desoidentity"
        id="identity"
        frameBorder="0"
        src="https://identity.deso.org/embed?v=2"
        style={{height: "100vh", width: "100vw", display: "none", position: "fixed",  zIndex: 1000, left: 0, top: 0}}
    ></iframe>
      
      {loggedIn ? (
        <First
          loginWithDeso={loginWithDeso}
          desoIdentity={desoIdentity}
          desoApi={desoApi}
          publicKey = {publicKey}
        />
      ) : (
        <Landing loginWithDeso={loginWithDeso} />
      )}
    </>
  );
}

export default App;
