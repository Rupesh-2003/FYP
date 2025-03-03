// import pinataSDK from "@pinata/sdk"
import axios from "axios";
import pinataSDK from "@pinata/sdk";

// const pinata = new pinataSDK({ pinataApiKey: process.env.REACT_APP_PINATA_API_KEY, pinataSecretApiKey: process.env.REACT_APP_PINATA_API_SECRET });

const pinata = new pinataSDK({
  pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyM2RmYTZiZi01YjY1LTRkYjktYmQzOS1lMDExNWM4NzM3NTEiLCJlbWFpbCI6InJ1cGVzaGRqc2NlQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5NjRmMGI2ZDg2ODcyYTY5MmIwZiIsInNjb3BlZEtleVNlY3JldCI6ImE5NjcxMmQxZjMxNzA1ZWNkMzlhMTk4NjM2ZTNiODE2N2E1N2NhOWRjMmM0ZmJiNmQzNmI1MGIzMDYwN2RhZmIiLCJleHAiOjE3NzEwMTU0MTF9.L62Z6Rke5WNDhG-MPbpQdbQnRfwjJxED35uzEEb7Ivo",
  pinataGateway: "https://amethyst-magic-swift-515.mypinata.cloud",
});

const sendFileToIPFS = async (file) => {
  if (file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await pinata.upload.file(file);
      console.log("Result", result);
      return result.IpfsHash;


      // const resFile = await axios({
      //   method: "post",
      //   url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
      //   data: formData,
      //   headers: {
      //     Authorization: `Bearer ${process.env.REACT_PUBLIC_PINATA_JWT}`,
      //   },
      // });

      // console.log("Result", resFile);
      // return resFile.data.IpfsHash;
      // Usage `ipfs://${resFile.data.IpfsHash}`;
    } catch (error) {
      console.log("Error sending File to IPFS: ");
      console.log(error);
    }
  } else return "";
};
export async function uploadFilesToIPFS(fileList) {
  let files = fileList.map ? fileList : Array.from(fileList);
  const compatibleFileList = files.map(
    (file) => new File([file], file.name, { type: file.type })
  );

  console.log("Provided files:", files);
  console.log("Files without path property:", compatibleFileList);

  const results = await Promise.all(
    compatibleFileList.map((file) =>
      sendFileToIPFS(file).then((cid) => ({ name: file.name, cid }))
    )
  );
  console.log("IPFS upload results", results);
  return results;
}

// above code working

// import axios from "axios";
// import PinataSDK from "@pinata/sdk";

// const pinata = new PinataSDK({
//   pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyM2RmYTZiZi01YjY1LTRkYjktYmQzOS1lMDExNWM4NzM3NTEiLCJlbWFpbCI6InJ1cGVzaGRqc2NlQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5NjRmMGI2ZDg2ODcyYTY5MmIwZiIsInNjb3BlZEtleVNlY3JldCI6ImE5NjcxMmQxZjMxNzA1ZWNkMzlhMTk4NjM2ZTNiODE2N2E1N2NhOWRjMmM0ZmJiNmQzNmI1MGIzMDYwN2RhZmIiLCJleHAiOjE3NzEwMTU0MTF9.L62Z6Rke5WNDhG-MPbpQdbQnRfwjJxED35uzEEb7Ivo",
//   pinataGateway: "https://amethyst-magic-swift-515.mypinata.cloud",
// });

// const sendFileToIPFS = async (file) => {
//   try {
//     const file_name = file.name;
//     const reader = new FileReader();
//     const base64String = reader.result.split(",")[1];
//     const binaryString = atob(base64String);
//     const arrayBuffer = new ArrayBuffer(binaryString.length);
//     const uint8Array = new Uint8Array(arrayBuffer);

//     for (let i = 0; i < binaryString.length; i++) {
//       uint8Array[i] = binaryString.charCodeAt(i);
//     }

//     const blob = new Blob([uint8Array], { type: "application/octet-stream" });
//     const file = new File([blob], `${file_name}`);

//     const data = new FormData();
//     data.append("file", file);

//     const upload = await fetch(
//       "https://api.pinata.cloud/pinning/pinFileToIPFS",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${process.env.REACT_PUBLIC_PINATA_JWT}`,
//         },
//         body: data,
//       }
//     );

//     const uploadRes = await upload.json();
//     console.log(uploadRes);
//     return uploadRes;
//   } catch (error) {
//     console.error("Error uploading to Pinata:", error);
//     throw error;
//   }
// };

// export async function uploadFilesToIPFS(fileList) {
//   let files = fileList.map ? fileList : Array.from(fileList);
//   const compatibleFileList = files.map(
//     (file) => new File([file], file.name, { type: file.type })
//   );

//   console.log("Provided files:", files);
//   console.log("Files without path property:", compatibleFileList);

//   const results = await Promise.all(
//     compatibleFileList.map((file) =>
//       sendFileToIPFS(file).then((cid) => ({ name: file.name, cid }))
//     )
//   );
//   console.log("IPFS upload results", results);
//   return results;
// }





// import { create } from "ipfs-http-client";

// let ipfs;
// try {
//     ipfs = create({
//         url: "https://ipfs.infura.io:5001/api/v0",
//     });
// } catch (error) {
//     console.error("IPFS error ", error);
//     ipfs = undefined;
// }

// export async function uploadFilesToIPFS(fileList) {
//     if (!ipfs) {
//         return console.error('IPFS service can\'t be conencted :(');
//     }
//     let files = fileList.map ? fileList : Array.from(fileList);
//     const compatibleFileList = files.map(file => new File([file], file.name, { type: file.type }));

//     console.log("Provided files:", files);
//     console.log("Files without path property:", compatibleFileList);

//     const results = await Promise.all(compatibleFileList.map(ipfs.add));
//     compatibleFileList.forEach((file, idx) => results[idx].name = file.name || "file")
//     console.log("IPFS upload results", results);
//     return results;
// }

// // Using web3.storage
// import { Web3Storage } from 'web3.storage'

// const IPFS_TOKEN = process.env.REACT_APP_IPFS_TOKEN || null;

// const ipfsStorage = new Web3Storage({ IPFS_TOKEN });

// export async function uploadFilesToIPFS(files) {
//   if (!IPFS_TOKEN) {
//     return console.error('A token is needed. You can create one on https://web3.storage')
//   }

//   console.log(`Uploading ${files.length} files`)
//   const cid = await ipfsStorage.put(files)
//   console.log('Content added with CID:', cid)
//   return cid;
// }
