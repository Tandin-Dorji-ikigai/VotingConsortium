#!/bin/bash
if [ -d "/workspaces/votingconsortium/bin" ] ; then
PATH="/workspaces/votingconsortium/bin:$PATH"
fi

# Sets the context for native peer commands
function usage {
    echo "Usage: . ./set_peer_env.sh ORG_NAME"
    echo "Sets the organization context for native peer execution"
}

if [ "$1" == "" ]; then
    usage
    exit 1
fi

export ORG_CONTEXT=$1
echo "ORG_CONTEXT: $ORG_CONTEXT"

# Convert organization name to uppercase
MSP_ID="$(tr '[:lower:]' '[:upper:]' <<< ${ORG_CONTEXT:0:1})${ORG_CONTEXT:1}"
export ORG_NAME=$MSP_ID
echo "ORG_NAME: $ORG_NAME"

# Set the local MSP ID
export CORE_PEER_LOCALMSPID="EvotingMSP"
echo "CORE_PEER_LOCALMSPID: $CORE_PEER_LOCALMSPID"

# Set logging specifications
export FABRIC_LOGGING_SPEC=INFO
echo "FABRIC_LOGGING_SPEC: $FABRIC_LOGGING_SPEC"

# Set the location of the core.yaml
export FABRIC_CFG_PATH=/workspaces/votingconsortium/config/evote
echo "FABRIC_CFG_PATH: $FABRIC_CFG_PATH"

export CORE_PEER_ADDRESS=evote.$1.com:7051
echo "CORE_PEER_ADDRESS: $CORE_PEER_ADDRESS"

# Set the path to the MSP configuration for the admin user
export CORE_PEER_MSPCONFIGPATH=/workspaces/votingconsortium/config/crypto-config/peerOrganizations/$1.com/users/Admin@$1.com/msp
echo "CORE_PEER_MSPCONFIGPATH: $CORE_PEER_MSPCONFIGPATH"

# Set the address of the orderer
export ORDERER_ADDRESS=orderer.voting.com:7050
echo "ORDERER_ADDRESS: $ORDERER_ADDRESS"

# Disable TLS
export CORE_PEER_TLS_ENABLED=false
echo "CORE_PEER_TLS_ENABLED: $CORE_PEER_TLS_ENABLED"
