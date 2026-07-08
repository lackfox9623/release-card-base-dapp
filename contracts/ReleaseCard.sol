// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ReleaseCard {
    uint256 public nextReleaseId = 1;

    struct ReleaseNote {
        address shipper;
        string projectName;
        string versionName;
        string status;
        string summary;
        uint256 createdAt;
    }

    mapping(uint256 => ReleaseNote) private releases;

    event ReleasePublished(
        uint256 indexed releaseId,
        address indexed shipper,
        string projectName,
        string versionName,
        string status
    );

    function publishRelease(
        string calldata projectName,
        string calldata versionName,
        string calldata status,
        string calldata summary
    ) external returns (uint256 releaseId) {
        require(bytes(projectName).length > 0 && bytes(projectName).length <= 42, "Invalid project");
        require(bytes(versionName).length > 0 && bytes(versionName).length <= 24, "Invalid version");
        require(bytes(status).length > 0 && bytes(status).length <= 18, "Invalid status");
        require(bytes(summary).length > 0 && bytes(summary).length <= 220, "Invalid summary");

        releaseId = nextReleaseId++;
        releases[releaseId] = ReleaseNote({
            shipper: msg.sender,
            projectName: projectName,
            versionName: versionName,
            status: status,
            summary: summary,
            createdAt: block.timestamp
        });

        emit ReleasePublished(releaseId, msg.sender, projectName, versionName, status);
    }

    function getRelease(
        uint256 releaseId
    )
        external
        view
        returns (
            address shipper,
            string memory projectName,
            string memory versionName,
            string memory status,
            string memory summary,
            uint256 createdAt
        )
    {
        ReleaseNote storage entry = releases[releaseId];
        return (
            entry.shipper,
            entry.projectName,
            entry.versionName,
            entry.status,
            entry.summary,
            entry.createdAt
        );
    }
}
