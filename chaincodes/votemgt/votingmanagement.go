package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing the production of cakes
type SmartContract struct {
	contractapi.Contract
}

// Vote represents a voting topic entity with attributes for tracking votes
type Vote struct {
	ID          string           `json:"id"`
	Topic       string           `json:"topic"`
	Description string           `json:"description"`
	Yes         int64            `json:"yes"`
	No          int64            `json:"no"`
	Status      string           `json:"status"`
	Voters      map[string]bool `json:"voters"`
}

// CreateVotingTopic creates a new voting topic
func (s *SmartContract) CreateVotingTopic(ctx contractapi.TransactionContextInterface, id, topic, description string) error {
	// Check if a voting topic with the given id already exists
	existingTopicJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if existingTopicJSON != nil {
		return fmt.Errorf("a voting topic with the ID '%s' already exists", id)
	}

	// Initialize the voters map
	voters := make(map[string]bool)

	// Create the voting topic
	vote := Vote{
		ID:          id,
		Topic:       topic,
		Description: description,
		Yes:         0,
		No:          0,
		Status:      "pending",
		Voters:      voters,
	}

	// Marshal the vote object to JSON
	voteJSON, err := json.Marshal(vote)
	if err != nil {
		return fmt.Errorf("failed to marshal vote JSON: %v", err)
	}

	// Put the vote object into the world state
	err = ctx.GetStub().PutState(id, voteJSON)
	if err != nil {
		return fmt.Errorf("failed to put state: %v", err)
	}

	// Emit an event indicating that a voting topic has been created
	eventPayload := fmt.Sprintf("Voting topic created: %s", id)
	err = ctx.GetStub().SetEvent("CreateVotingTopic", []byte(eventPayload))
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	return nil
}

// UpdateVoteDetails updates the details of a voting topic
func (s *SmartContract) UpdateVoteDetails(ctx contractapi.TransactionContextInterface, id, topic, description string) error {
	vote, err := s.GetVotingTopic(ctx, id)
	if err != nil {
		return err
	}

	vote.Topic = topic
	vote.Description = description

	// Marshal the updated vote object to JSON
	voteJSON, err := json.Marshal(vote)
	if err != nil {
		return fmt.Errorf("failed to marshal updated vote JSON: %v", err)
	}

	// Put the updated vote object into the world state
	err = ctx.GetStub().PutState(id, voteJSON)
	if err != nil {
		return fmt.Errorf("failed to put updated state: %v", err)
	}

	// Emit an event indicating that the voting topic details have been updated
	eventPayload := fmt.Sprintf("Updated voting topic details: %s", id)
	err = ctx.GetStub().SetEvent("UpdateVoteDetails", []byte(eventPayload))
	if err != nil {
		return fmt.Errorf("failed to set event: %v", err)
	}

	return nil
}

func (s *SmartContract) DeleteVotingTopic(ctx contractapi.TransactionContextInterface, id string) error {
	err := ctx.GetStub().DelState(id)
	if err != nil {
		return fmt.Errorf("failed to delete state: %v", err)
	}
	eventPayload := fmt.Sprintf("Deleted Voting topic: %s", id)
	err = ctx.GetStub().SetEvent("DeleteVotingTopic", []byte(eventPayload))
	if err != nil {
		return fmt.Errorf("event failed to register. %v", err)
	}
	return nil
}

func (s *SmartContract) CastVote(ctx contractapi.TransactionContextInterface, id string, voteType string) error {
	// Retrieve the voting topic from the ledger
	vote, err := s.GetVotingTopic(ctx, id)
	if err != nil {
		return err
	}

	// Check if the user has already voted
	userID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client identity: %v", err)
	}
	if _, ok := vote.Voters[userID]; ok {
		return fmt.Errorf("user '%s' has already casted a vote for this topic", userID)
	}

	// Update the vote counts based on the type of vote
	switch voteType {
	case "yes":
		vote.Yes++
	case "no":
		vote.No++
	default:
		return fmt.Errorf("invalid vote type. Must be 'yes' or 'no'")
	}

	// Mark the user as voted for this topic
	vote.Voters[userID] = true

	// Marshal the updated vote struct into JSON
	voteJSON, err := json.Marshal(vote)
	if err != nil {
		return err
	}

	// Put the updated vote record back into the ledger
	err = ctx.GetStub().PutState(id, voteJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state. %v", err)
	}

	// Emit an event indicating that a vote has been cast
	eventPayload := fmt.Sprintf("Vote casted: %s", id)
	err = ctx.GetStub().SetEvent("CastVote", []byte(eventPayload))
	if err != nil {
		return fmt.Errorf("event failed to register. %v", err)
	}

	return nil
}

func (s *SmartContract) GetVotingTopic(ctx contractapi.TransactionContextInterface, id string) (*Vote, error) {
	voteJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read world state: %v", err)
	}

	if voteJSON == nil {
		return nil, fmt.Errorf("voting topic '%s' does not exist", id)
	}

	var vote Vote
	err = json.Unmarshal(voteJSON, &vote)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal vote JSON: %v", err)
	}

	eventPayload := fmt.Sprintf("Read voting topic: %s", id)
	err = ctx.GetStub().SetEvent("GetVotingTopic", []byte(eventPayload))
	if err != nil {
		return nil, fmt.Errorf("failed to set event: %v", err)
	}

	return &vote, nil
}
func (s *SmartContract) UpdateVoteStatus(ctx contractapi.TransactionContextInterface, id string) error {
	// Retrieve the voting topic from the ledger
	vote, err := s.GetVotingTopic(ctx, id)
	if err != nil {
		return err
	}

	// Determine the status based on vote counts
	if vote.Yes > vote.No {
		vote.Status = "approved"
	} else if vote.No > vote.Yes {
		vote.Status = "not approved"
	} else {
		vote.Status = "not decided"
	}

	// Marshal the updated vote struct into JSON
	voteJSON, err := json.Marshal(vote)
	if err != nil {
		return err
	}

	// Put the updated vote record back into the ledger
	err = ctx.GetStub().PutState(id, voteJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state. %v", err)
	}

	// Emit an event indicating that the vote status has been updated
	eventPayload := fmt.Sprintf("Vote status updated: %s", id)
	err = ctx.GetStub().SetEvent("UpdateVoteStatus", []byte(eventPayload))
	if err != nil {
		return fmt.Errorf("event failed to register. %v", err)
	}

	return nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		fmt.Printf("Error creating chaincode: %v\n", err)
		return
	}
	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting chaincode: %v\n", err)
	}
}
