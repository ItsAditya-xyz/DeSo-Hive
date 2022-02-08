import axios from "axios";
//var axios = require('axios')

const DEFAULT_NODE_URL = "https://love4src.com/api";
//const DEFAULT_NODE_URL = "https://api.desodev.com/api"
let client = null;

class DesoApi {
  constructor() {
    this.client = null;
    this.baseUrl = DEFAULT_NODE_URL;
  }

  async getPostsForPublicKey(
    username,
    publicKey,
    lastPostHashHex,
    numToFetch = 10
  ) {
    if (!username && !publicKey) {
      console.log("username or publicKey is required");
      return;
    }

    const path = "/v0/get-posts-for-public-key";
    const data = {
      PublicKeyBase58Check: publicKey,
      Username: username,
      ReaderPublicKeyBase58Check: "",
      LastPostHashHex: lastPostHashHex,
      NumToFetch: numToFetch,
      MediaRequired: false,
    };
    try {
      const result = await this.getClient().post(path, data);
      return result.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getFollowsStateless(username, following, numToFetch, publicKey){

    const path = "/v0/get-follows-stateless";
    const data = {
      Username: username,
      PublicKeyBase58Check: publicKey,
      GetEntriesFollowingUsername: !following,
      LastPublicKeyBase58Check: "",
      NumToFetch: numToFetch
    };
    try {
      const result = await this.getClient().post(path, data);
      return result.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createFollowTxn(publicKey, publicKeyToFollow, isFollow){
    if (!publicKey) {
      console.log("publicKey is required");
      return;
    }

    if (!publicKeyToFollow) {
      console.log("publicKeyToFollow is required");
      return;
    }

    const path = "/v0/create-follow-txn-stateless";
    const data = {
      FollowerPublicKeyBase58Check: publicKey,
      FollowedPublicKeyBase58Check: publicKeyToFollow,
      IsUnfollow: !isFollow,
      MinFeeRateNanosPerKB:2000
    };
    try {
      const result = await this.getClient().post(path, data);
      return result.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async getSingleProfile(publicKey, username) {
    if (!publicKey && !username) {
      console.log("publicKey or username is required");
      return;
    }

    const path = "/v0/get-single-profile";
    const data = {
      PublicKeyBase58Check: publicKey,
      Username: username,
    };

    try {
      const result = await this.getClient().post(path, data);
      return result.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getSinglePost(
    postHash,
    commentLimit = 20,
    fetchParents = false,
    commentOffset = 0,
    addGlobalFeedBool = false
  ) {
    if (!postHash) {
      console.log("postHash is required");
      return;
    }

    const path = "/v0/get-single-post";
    const data = {
      PostHashHex: postHash,
      ReaderPublicKeyBase58Check: "",
      FetchParents: fetchParents,
      CommentOffset: commentOffset,
      CommentLimit: commentLimit,
      AddGlobalFeedBool: addGlobalFeedBool,
    };
    try {
      const result = await this.getClient().post(path, data);
      return result.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async submitPost(publicKey, body, postExtraData, ParentStakeID, imageURL) {
    if (!publicKey) {
      console.log("publicKey is required");
      return;
    }

    if (!body) {
      console.log("body is required");
      return;
    }

    const path = "/v0/submit-post";
    const data = {
      UpdaterPublicKeyBase58Check: publicKey,
      PostHashHexToModify: "",
      ParentStakeID: ParentStakeID,
      Title: "",
      BodyObj: { Body: body, ImageURLs: imageURL },
      RecloutedPostHashHex: "",
      PostExtraData: postExtraData,
      Sub: "",
      IsHidden: false,
      MinFeeRateNanosPerKB: 2000,
    };
    try {
      const result = await this.getClient().post(path, data);
      return result.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async submitTransaction(signedTransactionHex) {
    if (!signedTransactionHex) {
      console.log("signedTransactionHex is required");
      return;
    }

    const path = "/v0/submit-transaction";
    const data = {
      TransactionHex: signedTransactionHex,
    };
    try {
      const result = await this.getClient().post(path, data);
      return result.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getUsersStateless(publicKeyList, skipForLeaderboard) {
    if (!publicKeyList) {
      console.log("publicKeyList is required");
      return;
    }

    const path = "/v0/get-users-stateless";
    const data = {
      PublicKeysBase58Check: publicKeyList,
      SkipForLeaderboard: skipForLeaderboard,
    };
    try {
      const result = await this.getClient().post(path, data);
      return result.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async uploadImage(file, publicKey, JwtToken) {
    if (!publicKey) {
      alert(" logged in public key not found");
    }
    const path = "/v0/upload-image";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("UserPublicKeyBase58Check", publicKey);
    formData.append("JWT", JwtToken);
    //content type multipart/form-data
    try {
      const result = await this.getUploadClient().post(path, formData);
      return result.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async getProfilesPartialMatch(partialName) {
    if (!partialName) {
      console.log("partialName is required");
      return;
    }

    const path = "/v0/get-profiles";
    const data = {
      ReaderPublicKeyBase58Check: "",
      UsernamePrefix: partialName,
    };
    try {
      const result = await this.getClient().post(path, data);
      return result.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  getClient() {
    client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return client;
  }

  getUploadClient() {
    if (client) return client;
    client = axios.create({
      baseURL: "https://node.deso.org/api",
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });
    return client;
  }
}

export default DesoApi;
