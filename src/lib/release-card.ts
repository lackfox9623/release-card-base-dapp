import type { Address } from "viem";

export const MAX_PROJECT_LENGTH = 42;
export const MAX_VERSION_LENGTH = 24;
export const MAX_STATUS_LENGTH = 18;
export const MAX_SUMMARY_LENGTH = 220;

export const releaseCardAbi = [
  {
    type: "event",
    name: "ReleasePublished",
    inputs: [
      { name: "releaseId", type: "uint256", indexed: true },
      { name: "shipper", type: "address", indexed: true },
      { name: "projectName", type: "string", indexed: false },
      { name: "versionName", type: "string", indexed: false },
      { name: "status", type: "string", indexed: false },
    ],
  },
  {
    type: "function",
    name: "publishRelease",
    stateMutability: "nonpayable",
    inputs: [
      { name: "projectName", type: "string" },
      { name: "versionName", type: "string" },
      { name: "status", type: "string" },
      { name: "summary", type: "string" },
    ],
    outputs: [{ name: "releaseId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getRelease",
    stateMutability: "view",
    inputs: [{ name: "releaseId", type: "uint256" }],
    outputs: [
      { name: "shipper", type: "address" },
      { name: "projectName", type: "string" },
      { name: "versionName", type: "string" },
      { name: "status", type: "string" },
      { name: "summary", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "nextReleaseId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function isAddressLike(value?: string) {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
}

const configuredReleaseCardContractAddress =
  process.env.NEXT_PUBLIC_RELEASE_CARD_CONTRACT_ADDRESS?.trim();

export const releaseCardContractAddress = isAddressLike(
  configuredReleaseCardContractAddress,
)
  ? (configuredReleaseCardContractAddress as Address)
  : undefined;
