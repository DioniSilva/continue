import { BaseSessionMetadata } from "core";
import type { RemoteSessionMetadata } from "core/control-plane/client";
import MiniSearch from "minisearch";
import React, {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Shortcut from "../gui/Shortcut";

import { XMarkIcon } from "@heroicons/react/24/solid";
import {
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  newSession,
  setAllSessionMetadata,
} from "../../redux/slices/sessionSlice";
import { setDialogMessage, setShowDialog } from "../../redux/slices/uiSlice";
import {
  refreshSessionMetadata,
  saveCurrentSession,
} from "../../redux/thunks/session";
import { getFontSize, getPlatform } from "../../util";
import { ROUTES } from "../../util/navigation";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";
import { Button } from "../ui";
import { HistoryTableRow } from "./HistoryTableRow";
import { groupSessionsByDate, parseDate } from "./util";

export function History() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const ideMessenger = useContext(IdeMessengerContext);
  const mediaUrl = (window as Window & { vscMediaUrl?: string }).vscMediaUrl;

  const [searchTerm, setSearchTerm] = useState("");

  const minisearch = useRef<MiniSearch>(
    new MiniSearch({
      fields: ["title"],
      storeFields: ["title", "sessionId", "id"],
    }),
  ).current;

  const allSessionMetadata = useAppSelector(
    (state) => state.session.allSessionMetadata,
  );
  const hasHistory = useAppSelector(
    (state) => state.session.history.length > 0,
  );
  const isSessionMetadataLoading = useAppSelector(
    (state) => state.session.isSessionMetadataLoading,
  );

  useEffect(() => {
    try {
      minisearch.removeAll();
      minisearch.addAll(
        allSessionMetadata.map((session) => ({
          title: session.title,
          sessionId: session.sessionId,
          id: session.sessionId,
        })),
      );
    } catch (e) {
      console.log("error adding sessions to minisearch", e);
    }
  }, [allSessionMetadata]);

  const platform = useMemo(() => getPlatform(), []);

  const filteredAndSortedSessions: (
    | BaseSessionMetadata
    | RemoteSessionMetadata
  )[] = useMemo(() => {
    // 1. Exact phrase matching
    const exactResults = minisearch.search(searchTerm, {
      fuzzy: false,
    });

    // 2. Fuzzy matching with higher tolerance
    const fuzzyResults = minisearch.search(searchTerm, {
      fuzzy: 0.3,
    });

    // 3. Prefix matching for partial words
    const prefixResults = minisearch.search(searchTerm, {
      prefix: true,
      fuzzy: 0.2,
    });

    // Combine results, with exact matches having higher priority
    const allResults = [
      ...exactResults.map((r) => ({ ...r, priority: 3 })),
      ...fuzzyResults.map((r) => ({ ...r, priority: 2 })),
      ...prefixResults.map((r) => ({ ...r, priority: 1 })),
    ];

    // Remove duplicates while preserving highest priority
    const uniqueResultsMap = new Map<string, any>();
    allResults.forEach((result) => {
      const existing = uniqueResultsMap.get(result.id);
      if (!existing || existing.priority < result.priority) {
        uniqueResultsMap.set(result.id, result);
      }
    });
    const uniqueResults = Array.from(uniqueResultsMap.values());

    const sessionIds = uniqueResults
      .sort((a, b) => b.priority - a.priority || b.score - a.score)
      .map((result) => result.id);

    return allSessionMetadata
      .filter((session) => {
        return searchTerm === "" || sessionIds.includes(session.sessionId);
      })
      .sort(
        (a, b) =>
          parseDate(b.dateCreated).getTime() -
          parseDate(a.dateCreated).getTime(),
      );
  }, [allSessionMetadata, searchTerm, minisearch]);

  const sessionGroups = useMemo(() => {
    return groupSessionsByDate(filteredAndSortedSessions);
  }, [filteredAndSortedSessions]);

  const showClearSessionsDialog = () => {
    dispatch(
      setDialogMessage(
        <ConfirmationDialog
          title={`Clear sessions`}
          text={`Are you sure you want to permanently delete all chat sessions, including the current chat session?`}
          onConfirm={async () => {
            // optimistic update
            dispatch(setAllSessionMetadata([]));

            // actual update + refresh
            await ideMessenger.request("history/clear", undefined);
            void dispatch(refreshSessionMetadata({}));

            // start a new session
            dispatch(newSession());
            navigate(ROUTES.HOME);
          }}
        />,
      ),
    );
    dispatch(setShowDialog(true));
  };

  const handleCreateWorkspace = async () => {
    if (hasHistory) {
      await dispatch(
        saveCurrentSession({ openNewSession: true, generateTitle: true }),
      );
    } else {
      dispatch(newSession());
    }
    navigate(ROUTES.HOME);
  };

  const focusSearch = () => {
    searchInputRef.current?.focus();
  };

  return (
    <div
      style={{ fontSize: getFontSize() }}
      className="flex flex-1 flex-col overflow-auto overflow-x-hidden bg-[#0f1014] px-4 pb-6 text-[#f3f5f7]"
    >
      <div className="flex flex-col gap-4 pt-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {mediaUrl ? (
              <img
                src={`${mediaUrl}/icon-banner.png`}
                alt="CWI Rocket"
                className="h-6"
              />
            ) : (
              <span className="text-lg font-semibold tracking-wide">
                CWI Rocket
              </span>
            )}
          </div>
          <button
            onClick={handleCreateWorkspace}
            className="flex items-center gap-2 rounded-full bg-[#ff4f00] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_4px_20px_rgba(255,79,0,0.35)] transition hover:brightness-110"
          >
            <PlusIcon className="h-4 w-4" />
            Novo workspace
          </button>
        </div>

        <div className="text-description flex items-center gap-2 text-xs text-[#c7cad8]">
          <button
            className="border-border flex h-7 w-7 items-center justify-center rounded-full border border-transparent bg-[#1c1f27] transition hover:border-[#ff4f00]"
            onClick={focusSearch}
            title="Buscar workspaces"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
          </button>
          <button
            className="border-border flex h-7 w-7 items-center justify-center rounded-full border border-transparent bg-[#1c1f27] transition hover:border-[#ff4f00]"
            onClick={() => navigate(ROUTES.CONFIG)}
            title="Configurações"
          >
            <Cog6ToothIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative my-4 flex justify-center space-x-2">
        <input
          className="flex-1 rounded-full border border-transparent bg-[#1a1d24] py-2 pl-3 pr-9 text-sm text-[#f3f5f7] placeholder:text-[#777b8f] focus:border-[#ff4f00] focus:outline-none"
          ref={searchInputRef}
          placeholder="Buscar workspaces"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <XMarkIcon
            className="duration-50 absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transform cursor-pointer rounded-full p-0.5 text-[#c7cad8] transition-colors hover:bg-[#14161c]"
            onClick={() => {
              setSearchTerm("");
              if (searchInputRef.current) {
                searchInputRef.current.focus();
              }
            }}
          />
        )}
      </div>

      <div className="thin-scrollbar flex w-full flex-1 flex-col overflow-y-auto">
        {filteredAndSortedSessions.length === 0 && (
          <div className="m-3 text-center text-sm text-[#b4b7c3]">
            {isSessionMetadataLoading ? (
              "Carregando workspaces..."
            ) : (
              <>
                Nenhum workspace encontrado. Clique em{" "}
                <span className="font-semibold text-white">
                  “Novo workspace”
                </span>{" "}
                ou use o atalho <Shortcut>meta L</Shortcut> para começar.
              </>
            )}
          </div>
        )}

        <table className="flex w-full flex-1 flex-col">
          <tbody className="">
            {sessionGroups.map((group, groupIndex) => (
              <Fragment key={group.label}>
                <tr
                  className={`user-select-none sticky mb-3 ml-2 flex h-6 justify-start text-left text-base font-bold opacity-75 ${
                    groupIndex === 0 ? "mt-2" : "mt-8"
                  }`}
                >
                  <td colSpan={3}>{group.label}</td>
                </tr>
                {group.sessions.map((session, sessionIndex) => (
                  <HistoryTableRow
                    key={session.sessionId}
                    sessionMetadata={session}
                    index={sessionIndex}
                  />
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-border flex flex-col items-end justify-center border-0 border-t border-solid px-2 py-3 text-xs">
        <Button variant="secondary" size="sm" onClick={showClearSessionsDialog}>
          Clear chats
        </Button>
        <span
          className="text-description text-2xs"
          data-testid="history-sessions-note"
        >
          Chat history is saved to{" "}
          <span className="italic">
            {platform === "windows"
              ? "%USERPROFILE%/.continue"
              : "~/.continue/sessions"}
          </span>
        </span>
      </div>
    </div>
  );
}
