// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Certificate {
    string public name;
    string public organization;
    string public description;
    string public date;
    string public constant contract_author = "Ahmedou Bchrs";
    address owner;
    
    event certificateEvent(string certificateEvent_Name, string certificateEvent_Organization, string certificateEvent_Description, string certificateEvent_Date);
    event errorEvent(string errorEvent_Description);
    
    // Array to store certificate information
    CertificateInfo[] public certificates;
    
    // Struct to represent certificate information
    struct CertificateInfo {
        string name;
        string organization;
        string description;
        string date;
    }
    
    constructor(){
        name = "John Cena";
        organization = "WWE";
        description = "Certificate OF INVISIBILITY";
        date = "20/20/2020";
        owner = msg.sender;
    }
    
    modifier onlyOwner {
        if (msg.sender != owner) {
            emit errorEvent("!!!YOU SHALL NOT PASS!!!");
        } else {
            _;
        }
    }
    function getCertificate() public view returns (string memory, string memory, string memory, string memory) {
        return (name, organization, description, date);
    }
    //get the number of certificates inside the array
    function getCertificateCount() public view returns (uint256) {
        return certificates.length;
    }
    //API functions
    function storeCertificate(string memory _name, string memory _organization, string memory _date, string memory _description) public {
        certificates.push(CertificateInfo({
            name: _name,
            organization: _organization,
            description: _description,
            date: _date
        }));
    }
    function get_certificate(uint256 _index) public view returns (string memory, string memory, string memory, string memory) {
        require(_index < certificates.length, "Certificate not found");
        CertificateInfo memory certificate = certificates[_index];
        return (certificate.name, certificate.organization, certificate.date, certificate.description);
    }

    
    //UI function
    function setCertificate(string memory _name, string memory _organization, string memory _description, string memory _date) onlyOwner public {
        // Create a new certificate object
        CertificateInfo memory newCertificate = CertificateInfo(_name, _organization, _description, _date);
        // Add the new certificate to the array
        certificates.push(newCertificate);
        // Update the contract's state variables
        name = _name;
        organization = _organization;
        description = _description;
        date = _date;
        // Raise events to let any event subscribers know the current certificate info has changed
        emit certificateEvent(_name, _organization, _description, _date);
    }
}
