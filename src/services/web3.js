import Web3 from 'web3';

// const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID;
// const INFURA_ACCESS_TOKEN = process.env.REACT_APP_INFURA_ACCESS_TOKEN;
// console.log("Infura prj ID:", INFURA_PROJECT_ID);
// console.log("Infura access token:", INFURA_ACCESS_TOKEN);
// const infuraURL = `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`;
// const infuraURL = `https://rinkeby.infura.io/v3`;

// const infuraURL = `https://dev.kardiachain.io/`;
// const infuraURL = `https://rpc.kardiachain.io/`;
const infuraURL = `https://sepolia.infura.io/v3/928dba7f838d4064a81cae772add3369`

const web3 = new Web3(infuraURL);
window.customWeb3 = web3;

window.metamaskweb3 = new Web3(window.ethereum);

console.log("Web3 config:");
console.log("Infura URL:", infuraURL);
console.log("Web3: \n", web3);

export default web3;