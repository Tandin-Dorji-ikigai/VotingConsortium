const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

// Static Middleware
app.use(express.static(path.join(__dirname, 'public')))
app.post('/votes', async (req, res) => {
    try {
        const { id, topic, description } = req.body;
        const result = await submitTransaction('CreateVotingTopic', id, topic, description);
        res.status(204).send(result);
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).send(`Failed to submit transaction: ${error}`);
    }
});

app.get('/votes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await evaluateTransaction('GetVotingTopic', id);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(404).send(`Failed to evaluate transaction: ${error}`);
    }
});

app.put('/votes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { topic, description } = req.body;
        const result = await submitTransaction('UpdateVoteDetails', id, topic, description);
        res.status(204).send(result);
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).send(`Failed to submit transaction: ${error}`);
    }
});
app.delete('/votes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await submitTransaction('DeleteVotingTopic', id);
        res.send(result);
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).send(`Failed to submit transaction: ${error}`);
    }
});

app.post('/votes/:id/:voteType', async (req, res) => {
    try {
        const { id, voteType } = req.params;
        console.log(`Submitting transaction: CastVote for id ${id} with voteType ${voteType}`);

        const result = await submitTransaction('CastVote', id, voteType);
        console.log(`Transaction submitted successfully: ${result}`);

        res.send(result);
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).send(`Failed to submit transaction: ${error}`);
    }
});

app.post('/votes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Submitting transaction: UpdateVoteStatus for id ${id}`);

        const result = await submitTransaction('UpdateVoteStatus', id);
        console.log(`Transaction submitted successfully: ${result}`);

        res.send(result);
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).send(`Failed to submit transaction: ${error}`);
    }
});


async function getContract() {
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const identity = await wallet.get('Admin@intervoting.com');
    const gateway = new Gateway();
    const connectionProfile = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'connection.json'),
        'utf8'));
    const connectionOptions = {
        wallet, identity: identity, discovery: {
            enabled: false, asLocalhost:
                true
        }
    };
    await gateway.connect(connectionProfile, connectionOptions);
    const network = await gateway.getNetwork('votingchannel');
    const contract = network.getContract('votemgt');
    return contract;
}
async function submitTransaction(functionName, ...args) {
    const contract = await getContract();
    const result = await contract.submitTransaction(functionName, ...args);
    return result.toString();
}
async function evaluateTransaction(functionName, ...args) {
    const contract = await getContract();
    const result = await contract.evaluateTransaction(functionName, ...args);
    return result.toString();
}
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/adminSide', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gg.html'));
});
module.exports = app; // Exporting app