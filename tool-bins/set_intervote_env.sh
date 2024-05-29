#!/bin/bash
sudo tar -C /usr/local -xzf go1.19.1.linux-amd64.tar.gz
if [ -d "/workspaces/votingconsortium/bin" ] ; then
PATH="/workspaces/votingconsortium/bin:$PATH"
fi
export PATH=$PATH:/usr/local/go/bin
export PATH=/usr/local/go/bin:$PATH
export GOFLAGS="-buildvcs=false"

export ORG_CONTEXT=intervote
export ORG_NAME=Intervoting
export CORE_PEER_LOCALMSPID=IntervotingMSP
# Logging specifications
export FABRIC_LOGGING_SPEC=INFO
# Location of the core.yaml
export FABRIC_CFG_PATH=/workspaces/votingconsortium/config/intervote
# Address of the peer
export CORE_PEER_ADDRESS=intervote.voting.com:7051
# Local MSP for the admin - Commands need to be executed as org admin
export CORE_PEER_MSPCONFIGPATH=/workspaces/votingconsortium/config/crypto-config/peerOrganizations/intervoting.com/users/Admin@intervoting.com/msp
# Address of the orderer
export ORDERER_ADDRESS=orderer.voting.com:7050
export CORE_PEER_TLS_ENABLED=false
#### Chaincode related properties
export CC_NAME="votingmanagement"
export CC_PATH="./chaincodes/votemgt/"
export CC_CHANNEL_ID="votemgt"
export CC_LANGUAGE="golang"
# Properties of Chaincode
export INTERNAL_DEV_VERSION="1.0"
export CC_VERSION="1.0"
export CC2_PACKAGE_FOLDER="./chaincodes/packages/"
export CC2_SEQUENCE=1
export CC2_INIT_REQUIRED="--init-required"
# Create the package with this name
export CC_PACKAGE_FILE="$CC2_PACKAGE_FOLDER$CC_NAME.$CC_VERSION-$INTERNAL_DEV_VERSION.tar.gz"
# Extracts the package ID for the installed chaincode
export CC_LABEL="$CC_NAME.$CC_VERSION-$INTERNAL_DEV_VERSION"

peer channel list