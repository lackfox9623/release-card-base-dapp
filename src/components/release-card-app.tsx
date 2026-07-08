"use client";

import {
  BadgeCheck,
  Blocks,
  GitCommitHorizontal,
  History,
  Loader2,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { parseEventLogs, type Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  MAX_PROJECT_LENGTH,
  MAX_STATUS_LENGTH,
  MAX_SUMMARY_LENGTH,
  MAX_VERSION_LENGTH,
  releaseCardAbi,
  releaseCardContractAddress,
} from "@/lib/release-card";

const STATUSES = ["Shipped", "Beta", "Patch", "Milestone"] as const;

function shortAddress(address?: Address) {
  if (!address || address === "0x0000000000000000000000000000000000000000") return "--";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(value?: bigint) {
  if (!value) return "--";
  return new Date(Number(value) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function friendlyError(error: unknown) {
  if (!(error instanceof Error)) return "Transaction was cancelled.";
  if (error.message.includes("User rejected")) return "Request cancelled in wallet.";
  if (error.message.includes("Invalid project")) return "Project needs 1 to 42 characters.";
  if (error.message.includes("Invalid version")) return "Version needs 1 to 24 characters.";
  if (error.message.includes("Invalid status")) return "Choose a short status.";
  if (error.message.includes("Invalid summary")) return "Summary needs 1 to 220 characters.";
  return error.message;
}

function ReleasePanel({
  projectName,
  versionName,
  status,
  summary,
  shipper,
  createdAt,
}: {
  projectName: string;
  versionName: string;
  status: string;
  summary: string;
  shipper?: Address;
  createdAt?: bigint;
}) {
  return (
    <article className="relative overflow-hidden rounded-[8px] border border-[#6df0c2]/50 bg-[#111822] p-5 text-[#f4f7fb] shadow-[0_30px_110px_rgba(0,0,0,0.35)] sm:p-8">
      <div className="absolute inset-x-0 top-0 h-10 border-b border-[#6df0c2]/20 bg-[#0b0f14]" />
      <div className="absolute left-5 top-4 flex gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(109,240,194,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(109,240,194,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="relative pt-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#6df0c2]">Release Card</p>
            <h2 className="mt-4 max-w-4xl break-words text-5xl font-black leading-none sm:text-7xl">
              {projectName || "Untitled release"}
            </h2>
          </div>
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[8px] border border-[#6df0c2]/50 bg-[#6df0c2] text-[#0f1115]">
            <Rocket className="h-9 w-9" />
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[8px] border border-[#6df0c2]/40 bg-[#0b0f14] p-4">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#6df0c2]">Version</p>
            <p className="mt-2 break-words text-3xl font-black">{versionName}</p>
          </div>
          <div className="rounded-[8px] border border-[#ffb84d]/50 bg-[#ffb84d] p-4 text-[#0f1115]">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#5a3500]">Status</p>
            <p className="mt-2 break-words text-3xl font-black">{status}</p>
          </div>
          <div className="rounded-[8px] border border-[#6df0c2]/40 bg-[#182431] p-4">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#6df0c2]">Chain</p>
            <p className="mt-2 text-3xl font-black">Base</p>
          </div>
        </div>

        <section className="mt-5 rounded-[8px] border border-[#6df0c2]/40 bg-[#0b0f14] p-5">
          <div className="flex items-center gap-2">
            <TerminalSquare className="h-5 w-5 text-[#6df0c2]" />
            <h3 className="text-xl font-black">Release summary</h3>
          </div>
          <p className="mt-5 min-h-[220px] whitespace-pre-wrap font-mono text-xl font-bold leading-9 text-[#d9fff2]">
            {summary || "Write the thing that shipped."}
          </p>
        </section>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[8px] border border-[#6df0c2]/40 bg-[#182431] p-4">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#6df0c2]">Shipper</p>
            <p className="mt-2 text-xl font-black">{shortAddress(shipper)}</p>
          </div>
          <div className="rounded-[8px] border border-[#6df0c2]/40 bg-[#182431] p-4">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#6df0c2]">Published</p>
            <p className="mt-2 text-xl font-black">{formatDate(createdAt)}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ReleaseCardApp() {
  const [releaseIdInput, setReleaseIdInput] = useState("1");
  const [projectName, setProjectName] = useState("Orbit Notes");
  const [versionName, setVersionName] = useState("v1.2.0");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("Shipped");
  const [summary, setSummary] = useState(
    "Added faster wallet recovery, cleaned the mobile flow, and shipped a clearer Base transaction receipt.",
  );
  const [message, setMessage] = useState("Publish a compact release note on Base.");
  const [lastAction, setLastAction] = useState<"create" | null>(null);

  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
    } catch {}
  }
  const { switchChain, isPending: switching } = useSwitchChain();
  const { data: hash, writeContractAsync, isPending: writing } = useWriteContract();
  const { data: receipt, isLoading: confirming } = useWaitForTransactionReceipt({ hash });

  const selectedConnector =
    connectors.find((connector) => connector.id === "injected") ??
    connectors.find((connector) => connector.id === "baseAccount") ??
    connectors[0];
  const parsedReleaseId = BigInt(Math.max(1, Number(releaseIdInput || "1")));

  const releaseQuery = useReadContract({
    abi: releaseCardAbi,
    address: releaseCardContractAddress,
    functionName: "getRelease",
    args: [parsedReleaseId],
    query: { enabled: Boolean(releaseCardContractAddress), refetchInterval: 12000 },
  });

  const totalQuery = useReadContract({
    abi: releaseCardAbi,
    address: releaseCardContractAddress,
    functionName: "nextReleaseId",
    query: { enabled: Boolean(releaseCardContractAddress), refetchInterval: 12000 },
  });

  const tuple = releaseQuery.data as
    | readonly [Address, string, string, string, string, bigint]
    | undefined;

  const liveRelease = useMemo(
    () =>
      tuple
        ? {
            shipper: tuple[0],
            projectName: tuple[1],
            versionName: tuple[2],
            status: tuple[3],
            summary: tuple[4],
            createdAt: tuple[5],
          }
        : undefined,
    [tuple],
  );

  const totalReleases = totalQuery.data ? Math.max(Number(totalQuery.data) - 1, 0) : 0;
  const validFields =
    projectName.trim().length > 0 &&
    projectName.trim().length <= MAX_PROJECT_LENGTH &&
    versionName.trim().length > 0 &&
    versionName.trim().length <= MAX_VERSION_LENGTH &&
    status.trim().length > 0 &&
    status.trim().length <= MAX_STATUS_LENGTH &&
    summary.trim().length > 0 &&
    summary.trim().length <= MAX_SUMMARY_LENGTH;

  const createBlocker = !releaseCardContractAddress
    ? "Contract not deployed yet. Run npm run deploy:contract, then add NEXT_PUBLIC_RELEASE_CARD_CONTRACT_ADDRESS."
    : !isConnected
      ? "Connect wallet first."
      : chainId !== base.id
        ? "Switch to Base first."
        : !validFields
          ? "Fill project, version, status, and summary."
          : "";

  useEffect(() => {
    if (!receipt || lastAction !== "create") return;
    void totalQuery.refetch();
    void releaseQuery.refetch();
    const logs = parseEventLogs({
      abi: releaseCardAbi,
      logs: receipt.logs,
      eventName: "ReleasePublished",
    });
    const releaseId = logs[0]?.args.releaseId;
    window.setTimeout(() => {
      if (releaseId) setReleaseIdInput(releaseId.toString());
      setMessage(releaseId ? `Release #${releaseId.toString()} published on Base.` : "Release published on Base.");
    }, 0);
  }, [lastAction, receipt, releaseQuery, totalQuery]);

  async function connectWallet() {
    const connectorQueue = [
      connectors.find((connector) => connector.id === "injected"),
      connectors.find((connector) => connector.id === "baseAccount"),
      selectedConnector,
    ]
      .filter((connector): connector is NonNullable<typeof selectedConnector> => Boolean(connector))
      .filter((connector, index, queue) => queue.findIndex((item) => item.id === connector.id) === index);

    if (connectorQueue.length === 0) {
      setMessage("No wallet connector found. Open this app inside Base App or a wallet browser.");
      return;
    }

    let lastError: unknown;
    setMessage("Opening wallet connection...");
    for (const connector of connectorQueue) {
      try {
        await connectAsync({ connector });
        setMessage("Wallet connected. Publish a release when ready.");
        return;
      } catch (error) {
        lastError = error;
      }
    }
    setMessage(friendlyError(lastError));
  }

  async function publishRelease() {
    const contractAddress = releaseCardContractAddress;
    if (createBlocker) {
      setMessage(createBlocker);
      return;
    }
    if (!contractAddress) {
      setMessage("Contract not deployed yet. Run npm run deploy:contract first.");
      return;
    }
    try {
      setLastAction("create");
      setMessage("Confirm the release card in your wallet.");
      await writeContractAsync({
        address: contractAddress,
        abi: releaseCardAbi,
        functionName: "publishRelease",
        args: [projectName.trim(), versionName.trim(), status.trim(), summary.trim()],
        chainId: base.id,
      });
      setMessage("Release sent. Waiting for Base confirmation...");
    } catch (error) {
      setMessage(friendlyError(error));
    }
  }

  return (
    <main className="min-h-screen bg-[#0f1115] text-[#f4f7fb]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[392px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[8px] border border-[#6df0c2]/40 bg-[#111822] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#6df0c2]">Release Card</p>
              <h1 className="mt-2 text-4xl font-black leading-none">Log what shipped.</h1>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] border border-[#6df0c2]/50 bg-[#6df0c2] text-[#0f1115]">
              <GitCommitHorizontal className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[8px] border border-[#6df0c2]/40 bg-[#0b0f14] p-3">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#6df0c2]">Releases</p>
              <p className="mt-2 text-3xl font-black">{totalReleases}</p>
            </div>
            <div className="rounded-[8px] border border-[#ffb84d]/50 bg-[#ffb84d] p-3 text-[#0f1115]">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#5a3500]">Chain</p>
              <p className="mt-2 text-xl font-black">Base</p>
            </div>
          </div>

          <section className="mt-4 rounded-[8px] border border-[#6df0c2]/40 bg-[#0b0f14] p-4">
            <h2 className="text-xl font-black">New release</h2>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#6df0c2]">Project</span>
                <input value={projectName} onChange={(event) => setProjectName(event.target.value)} maxLength={MAX_PROJECT_LENGTH} className="mt-1 w-full rounded-[8px] border border-[#6df0c2]/40 bg-[#111822] px-3 py-3 font-black outline-none" />
              </label>
              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#6df0c2]">Version</span>
                <input value={versionName} onChange={(event) => setVersionName(event.target.value)} maxLength={MAX_VERSION_LENGTH} className="mt-1 w-full rounded-[8px] border border-[#6df0c2]/40 bg-[#111822] px-3 py-3 font-black outline-none" />
              </label>
              <div>
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#6df0c2]">Status</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {STATUSES.map((value) => (
                    <button key={value} className={`rounded-[8px] border px-2 py-3 text-sm font-black ${value === status ? "border-[#ffb84d] bg-[#ffb84d] text-[#0f1115]" : "border-[#6df0c2]/40 bg-[#111822]"}`} onClick={() => setStatus(value)}>
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#6df0c2]">Summary</span>
                <textarea value={summary} onChange={(event) => setSummary(event.target.value)} maxLength={MAX_SUMMARY_LENGTH} rows={5} className="mt-1 w-full rounded-[8px] border border-[#6df0c2]/40 bg-[#111822] px-3 py-3 text-sm font-bold leading-6 outline-none" />
              </label>
            </div>
          </section>

          <div className="mt-4 space-y-3">
            {isConnected && chainId !== base.id ? (
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#ffb84d]/50 bg-[#ffb84d] px-4 py-3 font-black text-[#0f1115] disabled:opacity-60" disabled={switching} onClick={() => switchChain({ chainId: base.id })}>
                {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Switch to Base
              </button>
            ) : (
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#6df0c2] px-4 py-3 font-black text-[#0f1115] disabled:opacity-60" disabled={writing || confirming} onClick={publishRelease}>
                {writing || confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Publish Release
              </button>
            )}
            {isConnected ? (
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#6df0c2]/40 bg-[#111822] px-4 py-3 font-black" onClick={disconnectWallet}>{shortAddress(address)}</button>
            ) : (
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#6df0c2]/40 bg-[#111822] px-4 py-3 font-black disabled:opacity-60" disabled={!selectedConnector || connecting} onClick={connectWallet}>
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Connect wallet
              </button>
            )}
            <p className="rounded-[8px] border border-[#6df0c2]/40 bg-[#0b0f14] px-3 py-3 text-sm font-bold leading-6">{message}</p>
            {hash ? <a className="block rounded-[8px] border border-[#6df0c2]/40 bg-[#0b0f14] px-3 py-3 text-xs font-black leading-5 text-[#6df0c2] underline" href={`https://basescan.org/tx/${hash}`} rel="noreferrer" target="_blank">View transaction on BaseScan</a> : null}
            {createBlocker && isConnected ? <p className="rounded-[8px] border border-[#6df0c2]/40 bg-[#111822] px-3 py-3 text-xs font-bold leading-5">{createBlocker}</p> : null}
          </div>
        </aside>

        <section className="grid gap-4">
          <ReleasePanel projectName={liveRelease?.projectName || projectName} versionName={liveRelease?.versionName || versionName} status={liveRelease?.status || status} summary={liveRelease?.summary ?? summary} shipper={liveRelease?.shipper} createdAt={liveRelease?.createdAt} />
          <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
            <div className="rounded-[8px] border border-[#6df0c2]/40 bg-[#111822] p-4">
              <div className="flex items-center gap-2"><Search className="h-5 w-5" /><h2 className="text-2xl font-black">Load release</h2></div>
              <label className="mt-4 block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#6df0c2]">Release ID</span>
                <input value={releaseIdInput} onChange={(event) => setReleaseIdInput(event.target.value.replace(/\D/g, ""))} className="mt-1 w-full rounded-[8px] border border-[#6df0c2]/40 bg-[#0b0f14] px-3 py-3 text-2xl font-black outline-none" />
              </label>
            </div>
            <div className="rounded-[8px] border border-[#6df0c2]/40 bg-[#111822] p-4">
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#6df0c2]">What it does</p>
              <p className="mt-3 max-w-xl text-sm font-bold leading-6 text-[#d9fff2]">Release Card publishes compact project updates with version, status, shipper wallet, and timestamp on Base.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#6df0c2]/40 bg-[#0b0f14] px-3 py-2 text-xs font-black"><Blocks className="h-4 w-4 text-[#6df0c2]" /> Project update</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#6df0c2]/40 bg-[#0b0f14] px-3 py-2 text-xs font-black"><History className="h-4 w-4 text-[#6df0c2]" /> Version log</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#6df0c2]/40 bg-[#0b0f14] px-3 py-2 text-xs font-black"><ShieldCheck className="h-4 w-4 text-[#6df0c2]" /> Onchain record</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#6df0c2]/40 bg-[#0b0f14] px-3 py-2 text-xs font-black"><BadgeCheck className="h-4 w-4 text-[#6df0c2]" /> Wallet-authored</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
