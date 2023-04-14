const express = require('express');
const Web3 = require('web3');
const { spawn } = require('child_process');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');
const certContractABI = require('./ABI.json');
const port = 9500;
var myAccountNumber = '0xDB7e1C851b96121F49c9b26ec0BdF8Da8999b20f';
var myContractAddress = '0x4766da18f60A6a0e72249ed42350a1B50150aA8E';

let web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
web3.eth.getBalance(myAccountNumber).then(balance => console.log(balance)); 

const cert_contract = new web3.eth.Contract(certContractABI);
cert_contract.options.address = myContractAddress;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
// set up a template engine
app.set('view engine', 'ejs');


app.post('/add/certificate', async (req, res) => {
  const { name, organization, date, description } = req.body;

  try {
    const result = await cert_contract.methods.storeCertificate(name, organization, date, description).send({ from: myAccountNumber, gas: 5000000});
    res.status(200).json({ txHash: result.transactionHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error storing certificate on blockchain' });
  }
});
app.post('/verify/certificate', async (req, res) => {
	const { name } = req.body;
	
	const certificateCount = await cert_contract.methods.getCertificateCount().call();
	let certificateExists = false;
	let certificateData = {};
	for (let i = 0; i < certificateCount; i++) {
	  const certificate = await cert_contract.methods.get_certificate(i).call();
	  
	  if (certificate[0] === name) {
		certificateExists = true;
		console.log( typeof certificate[0], certificate[1], certificate[2], certificate[3]);
		certificateData = {"recipient":certificate[0], "organization":certificate[1], "certificate":certificate[2], "reason":certificate[3]}
		// collect the values from the blockchain using the smart contract
		break;
	  }
	}
  
	if (certificateExists) {
		// render certificate and hash it and returns certificate with hash
		console.log(certificateData["recipient"]);
		res.render('certificate', {certificateData: certificateData}, function(err, html){
			if(err) throw err;
			fs.writeFile('certificate.html', html, function(err){
				if (err) throw err;		
			})
		
		});
		
		const pythonProcess = spawn('python3', ['hashing.py', 'certificate.html']);

		pythonProcess.stdout.on('data', (data) => {
		  // The data event is emitted when the child process prints to stdout
		  const hashValue = data.toString().trim();
		  res.send(`Certificate hash:  ${hashValue}`);
		});
	
		pythonProcess.stderr.on('data', (data) => {
		  // The error event is emitted when the child process prints to stderr
		  console.error(`Error from Python script: ${data}`);
		  res.status(500).send('An error occurred while hashing the file.');
		});
	
		pythonProcess.on('exit', (code) => {
		  // The exit event is emitted when the child process exits
		  console.log(`Python script exited with code ${code}`);
		});
	} else {
	  res.status(404).send('Certificate not found');
	}
  });
 

app.listen(port, () => {
  console.log(`	Web3-API app listening at http://localhost:${port}`);
});
