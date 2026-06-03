import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Clock,
  Users,
  Beer,
  Trophy,
  Wallet,
  Eye,
  X,
  Trash2,
  Search,
  ReceiptText,
  Crown,
  Timer,
} from "lucide-react";

export default function History() {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("tagayrank-history");

    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const getInitials = (person) => {
  const sourceName = person?.fullName || `${person?.firstName || ""} ${person?.lastName || ""}`;
  const parts = sourceName.trim().split(" ").filter(Boolean);

  if (parts.length === 0) return "T";

  const first = parts[0]?.charAt(0) || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : "";

  return `${first}${last}`.toUpperCase() || "T";
};

  const [selectedSession, setSelectedSession] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("tagayrank-history", JSON.stringify(history));
  }, [history]);

  const formatDate = (value) => {
    if (!value) return "No date";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "No date";

    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "No time";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "No time";

    return date.toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "No date";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "No date";

    return date.toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value) => {
    return `₱${Number(value || 0).toFixed(2)}`;
  };

  const getDuration = (start, end) => {
    if (!start || !end) return "Not available";

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return "Not available";
    }

    const diffMs = endDate - startDate;

    if (diffMs < 0) return "Not available";

    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} hr`;

    return `${hours} hr ${minutes} min`;
  };

  const filteredHistory = useMemo(() => {
    return history.filter((session) => {
      const searchableText = `
        ${formatDate(session.sessionDate)}
        ${formatDateTime(session.startedAt)}
        ${formatDateTime(session.endedAt)}
        ${session.topDrinker?.name || ""}
        ${session.topDrinker?.fullName || ""}
        ${(session.participants || [])
          .map(
            (person) =>
              `${person.firstName} ${person.middleName} ${person.lastName} ${person.nickname} ${person.section}`
          )
          .join(" ")}
      `.toLowerCase();

      return searchableText.includes(search.toLowerCase());
    });
  }, [history, search]);

  const totalSavedSessions = history.length;

  const lifetimeDrinks = history.reduce(
    (sum, session) => sum + Number(session.totalDrinks || 0),
    0
  );

  const lifetimeBill = history.reduce(
    (sum, session) => sum + Number(session.totalBill || 0),
    0
  );

  const totalHistoryParticipants = history.reduce(
    (sum, session) => sum + Number(session.totalPresent || 0),
    0
  );

  const deleteSession = (id) => {
    const confirmed = confirm("Delete this saved session from history?");

    if (!confirmed) return;

    setHistory((prev) => prev.filter((session) => session.id !== id));

    if (selectedSession?.id === id) {
      setSelectedSession(null);
    }
  };

  const clearHistory = () => {
    const confirmed = confirm(
      "Clear all saved session history? This cannot be undone."
    );

    if (!confirmed) return;

    setHistory([]);
    setSelectedSession(null);
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">History</h1>
          <p className="page-subtitle">
            Review saved TagayRank sessions, rankings, expenses, and totals.
          </p>
        </div>

        <button
          onClick={clearHistory}
          disabled={history.length === 0}
          className="bg-red-500/10 text-red-600 rounded-2xl px-5 py-3 font-bold inline-flex items-center justify-center gap-2 hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={18} />
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="glass-soft rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">
                Sessions
              </p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                {totalSavedSessions}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center text-slate-700">
              <CalendarDays size={22} />
            </div>
          </div>
        </div>

        <div className="glass-soft rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">
                Total Drinks
              </p>
              <h2 className="text-3xl font-extrabold text-orange-600 mt-1">
                {lifetimeDrinks}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
              <Beer size={22} />
            </div>
          </div>
        </div>

        <div className="glass-soft rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">
                Total Present
              </p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                {totalHistoryParticipants}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center text-slate-700">
              <Users size={22} />
            </div>
          </div>
        </div>

        <div className="glass-soft rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">
                Total Bill
              </p>
              <h2 className="text-3xl font-extrabold text-orange-600 mt-1">
                {formatCurrency(lifetimeBill)}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center text-slate-700">
              <Wallet size={22} />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-soft rounded-3xl p-4 mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-ui input-search"
          />
        </div>
      </div>

      {history.length === 0 ? (
        <div className="glass-soft rounded-3xl p-10 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            No saved sessions yet
          </h2>
          <p className="text-slate-700 mt-2 font-medium">
            Go to Settings and click End Session & Save to History after a
            session.
          </p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass-soft rounded-3xl p-10 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            No matching sessions
          </h2>
          <p className="text-slate-700 mt-2 font-medium">
            Try searching by date, participant name, section, or top drinker.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredHistory.map((session) => (
            <div
              key={session.id}
              className="glass-soft rounded-3xl p-5 transition hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {formatDate(session.sessionDate || session.startedAt)}
                  </h2>

                  <p className="text-sm text-slate-700 font-medium mt-1">
                    {formatTime(session.startedAt)} -{" "}
                    {formatTime(session.endedAt)}
                  </p>
                </div>

                <div className="bg-white/70 text-orange-600 rounded-2xl px-3 py-2 text-sm font-bold shadow-sm">
                  {getDuration(session.startedAt, session.endedAt)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-white/45 rounded-2xl p-3">
                  <p className="text-xs text-slate-500 font-bold">Present</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">
                    {session.totalPresent || 0}
                  </p>
                </div>

                <div className="bg-white/45 rounded-2xl p-3">
                  <p className="text-xs text-slate-500 font-bold">Drinks</p>
                  <p className="text-xl font-extrabold text-orange-600 mt-1">
                    {session.totalDrinks || 0}
                  </p>
                </div>

                <div className="bg-white/45 rounded-2xl p-3">
                  <p className="text-xs text-slate-500 font-bold">Towers</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">
                    {session.towers || 0}
                  </p>
                </div>

                <div className="bg-white/45 rounded-2xl p-3">
                  <p className="text-xs text-slate-500 font-bold">Per Head</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">
                    {formatCurrency(session.perHead)}
                  </p>
                </div>
              </div>

              <div className="bg-white/45 rounded-2xl p-4 mt-4">
                <div className="flex items-center gap-3">
                  {session.topDrinker?.photo ? (
                    <img
                      src={session.topDrinker.photo}
                      alt={session.topDrinker.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-white/50 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-600 flex items-center justify-center font-extrabold shadow-sm">
                      {session.topDrinker ? getInitials(session.topDrinker) : <Crown size={20} />}
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-slate-500 font-bold">
                      Top Drinker
                    </p>
                    <p className="font-extrabold text-slate-900">
                      {session.topDrinker
                        ? `${session.topDrinker.name} (${session.topDrinker.drinks})`
                        : "No one yet"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  onClick={() => setSelectedSession(session)}
                  className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                >
                  <Eye size={17} />
                  View
                </button>

                <button
                  onClick={() => deleteSession(session.id)}
                  className="bg-red-500/10 text-red-600 rounded-2xl px-4 py-3 font-bold inline-flex items-center justify-center gap-2 hover:bg-red-500/20 transition"
                >
                  <Trash2 size={17} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSession &&
        createPortal(
          <div className="fixed inset-0 z-9999 bg-black/25 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-card w-full max-w-5xl rounded-3xl p-6 md:p-7 max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Session Details
                  </h2>

                  <p className="text-slate-700 font-medium mt-1">
                    {formatDate(selectedSession.sessionDate)} ·{" "}
                    {formatTime(selectedSession.startedAt)} -{" "}
                    {formatTime(selectedSession.endedAt)}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedSession(null)}
                  className="w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center text-slate-800 hover:bg-white/80"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/45 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock size={17} />
                    <p className="text-sm font-bold">Start Time</p>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900 mt-2">
                    {formatDateTime(selectedSession.startedAt)}
                  </p>
                </div>

                <div className="bg-white/45 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Timer size={17} />
                    <p className="text-sm font-bold">End Time</p>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900 mt-2">
                    {formatDateTime(selectedSession.endedAt)}
                  </p>
                </div>

                <div className="bg-white/45 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users size={17} />
                    <p className="text-sm font-bold">Present</p>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900 mt-2">
                    {selectedSession.totalPresent || 0}
                  </p>
                </div>

                <div className="bg-white/45 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Beer size={17} />
                    <p className="text-sm font-bold">Drinks</p>
                  </div>
                  <p className="text-3xl font-extrabold text-orange-600 mt-2">
                    {selectedSession.totalDrinks || 0}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
                <div className="space-y-5">
                  <div className="bg-white/45 rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <Trophy className="text-orange-500" size={22} />
                      <h3 className="text-xl font-extrabold text-slate-900">
                        Final Ranking
                      </h3>
                    </div>

                    {(selectedSession.ranking || []).length === 0 ? (
                      <p className="text-sm text-slate-700 font-medium">
                        No ranking saved.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {(selectedSession.ranking || []).map((person) => (
                          <div
                            key={`${person.id}-${person.rank}`}
                            className="bg-white/50 rounded-2xl p-3 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-11 h-11 shrink-0">
                                {person.photo ? (
                                  <img
                                    src={person.photo}
                                    alt={person.name}
                                    className="w-11 h-11 rounded-xl object-cover border border-white/50 shadow-sm"
                                  />
                                ) : (
                                  <div className="w-11 h-11 rounded-xl bg-white/70 flex items-center justify-center font-extrabold text-slate-800">
                                    {getInitials(person)}
                                  </div>
                                )}

                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-xs">
                                  {person.rank === 1
                                    ? "🥇"
                                    : person.rank === 2
                                    ? "🥈"
                                    : person.rank === 3
                                    ? "🥉"
                                    : person.rank}
                                </div>
                              </div>

                              <div>
                                <p className="font-extrabold text-slate-900">
                                  {person.name}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {person.section}
                                </p>
                              </div>
                            </div>

                            <p className="text-xl font-extrabold text-orange-600">
                              {person.drinks}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white/45 rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="text-orange-500" size={22} />
                      <h3 className="text-xl font-extrabold text-slate-900">
                        Present Participants
                      </h3>
                    </div>

                    {(selectedSession.participants || []).length === 0 ? (
                      <p className="text-sm text-slate-700 font-medium">
                        No participants saved.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(selectedSession.participants || []).map((person) => (
                          <div
                            key={person.id}
                            className="bg-white/50 rounded-2xl p-3 flex items-center gap-3"
                          >
                            {person.photo ? (
                              <img
                                src={person.photo}
                                alt={person.nickname || person.firstName}
                                className="w-12 h-12 rounded-2xl object-cover border border-white/50 shadow-sm shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-600 flex items-center justify-center font-extrabold shadow-sm shrink-0">
                                {getInitials(person)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-900 truncate">
                                {person.nickname || person.firstName}
                              </p>
                              <p className="text-sm text-slate-700 font-medium truncate">
                                {person.firstName} {person.middleName} {person.lastName}
                              </p>
                              <p className="text-xs text-slate-600 mt-1 truncate">
                                {person.section} · {person.drinks} drink
                                {Number(person.drinks || 0) === 1 ? "" : "s"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="bg-white/45 rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <Wallet className="text-orange-500" size={22} />
                      <h3 className="text-xl font-extrabold text-slate-900">
                        Ambagan Summary
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white/50 rounded-2xl p-4 flex items-center justify-between">
                        <p className="text-sm text-slate-600 font-bold">
                          Towers
                        </p>
                        <p className="font-extrabold text-slate-900">
                          {selectedSession.towers || 0}
                        </p>
                      </div>

                      <div className="bg-white/50 rounded-2xl p-4 flex items-center justify-between">
                        <p className="text-sm text-slate-600 font-bold">
                          Tower Price
                        </p>
                        <p className="font-extrabold text-slate-900">
                          {formatCurrency(selectedSession.towerPrice)}
                        </p>
                      </div>

                      <div className="bg-white/50 rounded-2xl p-4 flex items-center justify-between">
                        <p className="text-sm text-slate-600 font-bold">
                          Tower Subtotal
                        </p>
                        <p className="font-extrabold text-slate-900">
                          {formatCurrency(selectedSession.towerSubtotal)}
                        </p>
                      </div>

                      <div className="bg-white/50 rounded-2xl p-4 flex items-center justify-between">
                        <p className="text-sm text-slate-600 font-bold">
                          Expenses Total
                        </p>
                        <p className="font-extrabold text-slate-900">
                          {formatCurrency(selectedSession.expensesTotal)}
                        </p>
                      </div>

                      <div className="bg-white/60 rounded-2xl p-4 flex items-center justify-between">
                        <p className="text-sm text-slate-600 font-bold">
                          Total Bill
                        </p>
                        <p className="text-xl font-extrabold text-orange-600">
                          {formatCurrency(selectedSession.totalBill)}
                        </p>
                      </div>

                      <div className="bg-white/60 rounded-2xl p-4 flex items-center justify-between">
                        <p className="text-sm text-slate-600 font-bold">
                          Per Head
                        </p>
                        <p className="text-xl font-extrabold text-slate-900">
                          {formatCurrency(selectedSession.perHead)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/45 rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <ReceiptText className="text-orange-500" size={22} />
                      <h3 className="text-xl font-extrabold text-slate-900">
                        Other Expenses
                      </h3>
                    </div>

                    {(selectedSession.expenses || []).length === 0 ? (
                      <p className="text-sm text-slate-700 font-medium">
                        No other expenses saved.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {(selectedSession.expenses || []).map((item) => (
                          <div
                            key={item.id}
                            className="bg-white/50 rounded-2xl p-3 flex items-center justify-between gap-3"
                          >
                            <p className="font-bold text-slate-900">
                              {item.name}
                            </p>
                            <p className="font-extrabold text-orange-600">
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}