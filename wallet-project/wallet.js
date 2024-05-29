/**
 * Demonstrates the use of wallet API
 * Utility for managing the wallet for users.
 */

// Using it for file access
const fs = require('fs');
const path = require('path');

// Import the classes for managing file system wallet
const { Wallets } = require('fabric-network');

// Location of the crypto for the dev environment
const CRYPTO_CONFIG = path.resolve(__dirname, '../config/crypto-config');
const CRYPTO_CONFIG_PEER_ORGS = path.join(CRYPTO_CONFIG, 'peerOrganizations');

// Folder for creating the wallet - All identities written under this
const WALLET_FOLDER = './wallet';

var wallet;

main();

async function main() {
    // Get the requested action
    let action = 'list';
    if (process.argv.length > 2) {
        action = process.argv[2];
    } else {
        console.log(`Usage: node wallet.js list
            node wallet.js add evote Admin)
            Not enough arguments.`);
        return;
    }
    console.log(CRYPTO_CONFIG_PEER_ORGS);
    
    // Create an instance of the file system wallet
    wallet = await Wallets.newFileSystemWallet(WALLET_FOLDER);
    console.log(process.argv.length);

    // Check on the action requested by user
    if (action == 'list') {
        console.log("List of identities in wallet:");
        listIdentities();
    } else if (action == 'add' || action == 'export') {
        if (process.argv.length < 5) {
            console.log("For 'add' & 'export' - Org & User are needed!!!");
            process.exit(1);
        }
        if (action == 'add') {
            addToWallet(process.argv[3], process.argv[4]);
            console.log('Done adding/updating.');
        } else {
            exportIdentity(process.argv[3], process.argv[4]);
        }
    }
}

/**
 * @param string Organization = Natuni or Privateuni or Interuni
 * @param string User = Admin User1 that needs to be added
 */
async function addToWallet(org, user) {
    // Read the cert & key file content
    try {
        // Read the certificate file content
        var cert = readCertCryptogen(org, user);
        // Read the keyfile content
        var key = readPrivateKeyCryptogen(org, user);
    } catch (e) {
        // No point in proceeding if the Certificate | Key can't be read
        console.log("Error reading certificate or key!!! " + org + "/" + user);
        process.exit(1);
    }
    
    // Create the MSP ID
    let mspId = createMSPId(org);
    // Create the label
    const identityLabel = createIdentityLabel(org, user);
    // Check to see if we've already enrolled the user.
    const userIdentity = await wallet.get(identityLabel);
    
    if (userIdentity) {
        console.log(`An identity for the user "${identityLabel}" already exists in the wallet`);
        return;
    }
    
    // Identity information.
    const identity = {
        credentials: {
            certificate: cert,
            privateKey: key,
        },
        mspId: mspId,
        type: 'X.509',
    };
    
    await wallet.put(identityLabel, identity);
    console.log(`Successfully added user "${identityLabel}" to the wallet`);
}

/**
 * Lists/Prints the identities in the wallet
 */
async function listIdentities() {
    console.log("Identities in Wallet:");
    // List all identities in the wallet
    const identities = await wallet.list();
    for (const identity of identities) {
        console.log(`user: ${identity}`);
    }
}

/**
 * Extracts the identity from the wallet
 * @param {string} org
 * @param {string} user
 */
async function exportIdentity(org, user) {
    // Label is used for identifying the identity in wallet
    let label = createIdentityLabel(org, user);
    // To retrieve, execute export
    let identity = await wallet.export(label);
    if (identity == null) {
        console.log(`Identity ${user} for ${org} Org Not found!!!`);
    } else {
        // Prints all attributes: label, Key, Cert
        console.log(identity);
    }
}

/**
 * Reads content of the certificate
 * @param {string} org
 * @param {string} user
 */
function readCertCryptogen(org, user) {
    var certPath = CRYPTO_CONFIG_PEER_ORGS + "/" + org + ".com/users/" + user + "@" + org +
        ".com/msp/signcerts/" + user + "@" + org + ".com-cert.pem";
    const cert = fs.readFileSync(certPath).toString();
    return cert;
}

/**
 * Reads the content of the user's private key
 * @param {string} org
 * @param {string} user
 */
function readPrivateKeyCryptogen(org, user) {
    var pkFolder = CRYPTO_CONFIG_PEER_ORGS + "/" + org + ".com/users/" + user + "@" + org +
        ".com/msp/keystore";
    let pkfile;
    fs.readdirSync(pkFolder).forEach(file => {
        pkfile = file;
        return;
    });
    return fs.readFileSync(pkFolder + "/" + pkfile).toString();
}

/**
 * Utility function
 * Creates the MSP ID from the org name for 'acme' it will be 'AcmeMSP'
 * @param {string} org
 */
function createMSPId(org) {
    return org.charAt(0).toUpperCase() + org.slice(1) + 'MSP';
}

/**
 * Utility function
 * Creates an identity label for the wallet
 * @param {string} org
 * @param {string} user
 */
function createIdentityLabel(org, user) {
    return user + '@' + org + '.com';
}
