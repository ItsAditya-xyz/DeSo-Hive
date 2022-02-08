class DesoIdentity {
  constructor() {
    this.init = false;
    this.pm_id = "";
    this.source = null;
    this.user = null;
    this.pendingRequests = [];
    this.identityWindow = null;
    this.loginResolve = null;
    this.signTxResolve = null;
    this.IdentityUsersKey = "identityUsersV2";
    this.transactionHex = "";
    this.jwtResolve = null;
    this.addListener();
  }

  loginAsync(accessLevel) {
    return new Promise((resolve, reject) => {
      this.identityWindow = window.open(
        "https://identity.deso.org/log-in?accessLevelRequest=" + accessLevel,
        null,
        "toolbar=no, width=800, height=1000, top=0, left=0"
      );
      this.loginResolve = resolve;
    });
  }

  logout(publicKey) {
    this.identityWindow = window.open(
      "https://identity.deso.org/logout?publicKey=" + publicKey,
      null,
      "toolbar=no, width=800, height=1000, top=0, left=0"
    );
    localStorage.removeItem(this.IdentityUsersKey);
  }

  logoutAsync(publicKey) {
    return new Promise((resolve, reject) => {
      this.identityWindow = window.open(
        "https://identity.deso.org/logout?publicKey=" + publicKey,
        null,
        "toolbar=no, width=800, height=1000, top=0, left=0"
      );
      this.loginResolve = resolve;
    });
  }

  signTxAsync(transactionHex) {
    return new Promise((resolve, reject) => {
      this.signTxResolve = resolve;
      this.transactionHex = transactionHex;
      this.getInfo();

      const id = this.uuid();
      const user = JSON.parse(localStorage.getItem(this.IdentityUsersKey));
      console.log(user);
      const payload = {
        accessLevel: user.accessLevel,
        accessLevelHmac: user.accessLevelHmac,
        encryptedSeedHex: user.encryptedSeedHex,
        transactionHex: transactionHex,
      };

      this.source.postMessage(
        {
          id: id,
          service: "identity",
          method: "sign",
          payload: payload,
        },
        "*"
      );
    });
  }

  getJWT() {
    return new Promise((resolve, reject) => {
      console.log("in getJWT()");
      this.jwtResolve = resolve;
      const id = this.uuid();
      const user = JSON.parse(localStorage.getItem(this.IdentityUsersKey));
      const payload = {
        accessLevel: user.accessLevel,
        accessLevelHmac: user.accessLevelHmac,
        encryptedSeedHex: user.encryptedSeedHex,
      };
      this.source.postMessage(
        {
          id: id,
          service: "identity",
          method: "jwt",
          payload: payload,
        },
        "*"
      );
    });
  }

  approveSignTx(transactionHex) {
    this.identityWindow = window.open(
      "https://identity.deso.org/approve?tx=" + transactionHex,
      null,
      "toolbar=no, width=800, height=1000, top=0, left=0"
    );
  }

  uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
  getInfo() {
    console.log("getinfo");
    const id = this.uuid();

    this.source.postMessage(
      {
        id: id,
        service: "identity",
        method: "info",
      },
      "*"
    );
  }

  handleLogin(payload) {
    console.log(payload);
    if (this.identityWindow) {
      this.identityWindow.close();
      this.identityWindow = null;
      const user = payload.users[payload.publicKeyAdded];
      if (user) {
        user["publicKey"] = payload.publicKeyAdded;
      }
      localStorage.setItem(this.IdentityUsersKey, JSON.stringify(user));
      this.loginResolve(user);
    }
  }

  handleSign(payload) {
    console.log(payload);

    const signedTransactionHex = payload["signedTransactionHex"];
    if (this.identityWindow) {
      this.identityWindow.close();
      this.identityWindow = null;
    }
    this.signTxResolve(signedTransactionHex);
  }

  respond(e, t, n) {
    e.postMessage(
      {
        id: t,
        service: "identity",
        payload: n,
      },
      "*"
    );
  }
  handleJwt(jwt) {
    this.jwtResolve(jwt);
  }
  handleInit(e) {
    if (!this.init) {
      this.init = true;

      for (const e of this.pendingRequests) {
        console.log("i'm in the pendingRequests loop");
        e.source.postMessage(e, "*");
      }

      this.pendingRequests = [];
      this.pm_id = e.data.id;
      this.source = e.source;
      console.log("this.source", this.source);
    }
    this.respond(e.source, e.data.id, {});
  }

  postMessage(e) {
    this.init
      ? this.iframe.contentWindow.postMessage(e, "*")
      : this.pendingRequests.push(e);
  }

  addListener() {
    window.addEventListener("message", (message) => {
      // console.log(message)

      const {
        data: { id: id, method: method, service: service, payload: payload },
      } = message;
      if (service !== "identity") {
        return;
      }
      if (payload.jwt) {
        this.handleJwt(payload.jwt);
      }
      if (method === "initialize") {
        this.handleInit(message);
      } else if ("signedTransactionHex" in payload) {
        console.log("signedTransactionHex", payload);
        this.handleSign(payload);
      } else if ("approvalRequired" in payload) {
        console.log("approvalRequired", payload);
        this.approveSignTx(this.transactionHex);
      } else if (method === "login") {
        this.handleLogin(payload);
      }
    });
  }
}

export default DesoIdentity;
