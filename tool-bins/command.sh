cryptogen generate --config=./crypto-config.yaml --output=crypto-config

configtxgen -outputBlock ./orderer/votinggenesis.block -channelID ordererchannel -profile VotingOrdererGenesis

configtxgen -outputCreateChannelTx ./votingchannel/votingchannel.tx -channelID votingchannel -profile VotingChannel


peer channel create -c votingchannel -f ./config/votingchannel/votingchannel.tx --outputBlock  ./config/votingchannel/votingchannel.block -o $ORDERER_ADDRESS

peer channel join -b ./config/votingchannel/votingchannel.block -o $ORDERER_ADDRESS



peer lifecycle chaincode package $CC_PACKAGE_FILE -p $CC_PATH --label $CC_LABEL

peer lifecycle chaincode install $CC_PACKAGE_FILE

peer lifecycle chaincode queryinstalled

peer lifecycle chaincode approveformyorg -n votemgt -v 1.0 -C votingchannel --sequence 1 --package-id $CC_PACKAGE_ID

peer lifecycle chaincode checkcommitreadiness -n votemgt -v 1.0 -C votingchannel --sequence 1

peer lifecycle chaincode commit -n votemgt -v 1.0 -C votingchannel --sequence 1

peer lifecycle chaincode querycommitted -n votemgt -C votingchannel




peer chaincode invoke -C votingchannel -n votemgt -c '{"function":"CreateVotingTopic","Args":["1", "This is a voting channel", "this is a voting channel description"]}'
peer chaincode invoke -C votingchannel -n votemgt -c '{"function":"CastVote","Args":["1", "yes"]}'
peer chaincode invoke -C votingchannel -n votemgt -c '{"function":"GetVotingTopic","Args":["1"]}'
peer chaincode query -C votingchannel -n votemgt -c '{"function":"GetVotingTopic","Args":["3"]}'

peer chaincode invoke -C votingchannel -n votemgt -c '{"function":"UpdateVoteDetails","Args":["1", "This is an updated voting detail", "This is the description about the updated voting that is written"]}'

peer chaincode invoke -C votingchannel -n votemgt -c '{"function":"DeleteVotingTopic","Args":["4"]}'


//privatevpting set peer

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
export CORE_PEER_LOCALMSPID="PrivatevotingMSP"
echo "CORE_PEER_LOCALMSPID: $CORE_PEER_LOCALMSPID"

# Set logging specifications
export FABRIC_LOGGING_SPEC=INFO
echo "FABRIC_LOGGING_SPEC: $FABRIC_LOGGING_SPEC"

# Set the location of the core.yaml
export FABRIC_CFG_PATH=/workspaces/votingconsortium/config/privatevote
echo "FABRIC_CFG_PATH: $FABRIC_CFG_PATH"

export CORE_PEER_ADDRESS=privatevote.$1.com:7051
echo "CORE_PEER_ADDRESS: $CORE_PEER_ADDRESS"

# Set the path to the MSP configuration for the admin user
export CORE_PEER_MSPCONFIGPATH=/workspaces/votingconsortium/config/crypto-config/peerOrganizations/privatevoting.com/users/Admin@privatevoting.com/msp
echo "CORE_PEER_MSPCONFIGPATH: $CORE_PEER_MSPCONFIGPATH"

# Set the address of the orderer
export ORDERER_ADDRESS=orderer.voting.com:7050
echo "ORDERER_ADDRESS: $ORDERER_ADDRESS"

# Disable TLS
export CORE_PEER_TLS_ENABLED=false
echo "CORE_PEER_TLS_ENABLED: $CORE_PEER_TLS_ENABLED"


//inter voting set peer 

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
export CORE_PEER_LOCALMSPID="IntervotingMSP"
echo "CORE_PEER_LOCALMSPID: $CORE_PEER_LOCALMSPID"

# Set logging specifications
export FABRIC_LOGGING_SPEC=INFO
echo "FABRIC_LOGGING_SPEC: $FABRIC_LOGGING_SPEC"

# Set the location of the core.yaml
export FABRIC_CFG_PATH=/workspaces/votingconsortium/config/intervote
echo "FABRIC_CFG_PATH: $FABRIC_CFG_PATH"

export CORE_PEER_ADDRESS=intervote.$1.com:7051
echo "CORE_PEER_ADDRESS: $CORE_PEER_ADDRESS"

# Set the path to the MSP configuration for the admin user
export CORE_PEER_MSPCONFIGPATH=/workspaces/votingconsortium/config/crypto-config/peerOrganizations/intervoting.com/users/Admin@intervoting.com/msp
echo "CORE_PEER_MSPCONFIGPATH: $CORE_PEER_MSPCONFIGPATH"

# Set the address of the orderer
export ORDERER_ADDRESS=orderer.voting.com:7050
echo "ORDERER_ADDRESS: $ORDERER_ADDRESS"

# Disable TLS
export CORE_PEER_TLS_ENABLED=false
echo "CORE_PEER_TLS_ENABLED: $CORE_PEER_TLS_ENABLED"
