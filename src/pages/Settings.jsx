import { useEffect, useMemo, useState } from "react";
import {
  RotateCcw,
  UserX,
  Beer,
  ReceiptText,
  Save,
  Clock,
  AlertTriangle,
  Gamepad2,
} from "lucide-react";
import { useAppDialog } from "../components/AppDialog";

const defaultSession = () => ({
  towers: 0,
  towerPrice: "",
  expenseName: "",
  expensePrice: "",
  expenses: [],
  startedAt: new Date().toISOString(),
});

const defaultGameState = {
  usedTruthIds: [],
  usedDareIds: [],
  usedAnswerIds: [],
  pickedParticipantIds: [],
  fairTurnMode: true,
  extremeMode: false,
};

export default function Settings() {
  const [participants, setParticipants] = useState(() => {
    const saved = localStorage.getItem("tagayrank-participants");

    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem("tagayrank-session");
    const fallback = defaultSession();

    try {
      if (!saved) return fallback;

      const parsed = JSON.parse(saved);

      return {
        ...fallback,
        ...parsed,
        startedAt: parsed.startedAt || new Date().toISOString(),
      };
    } catch {
      return fallback;
    }
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("tagayrank-history");

    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { dialog, confirmDialog } = useAppDialog();

  useEffect(() => {
    localStorage.setItem(
      "tagayrank-participants",
      JSON.stringify(participants)
    );
  }, [participants]);

  useEffect(() => {
    localStorage.setItem("tagayrank-session", JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem("tagayrank-history", JSON.stringify(history));
  }, [history]);

  const presentParticipants = useMemo(() => {
    return participants.filter((person) => person.present);
  }, [participants]);

  const rankedParticipants = useMemo(() => {
    return [...presentParticipants].sort(
      (a, b) => Number(b.drinks || 0) - Number(a.drinks || 0)
    );
  }, [presentParticipants]);

  const answeredRanking = useMemo(() => {
    return [...presentParticipants].sort(
      (a, b) =>
        Number(b.answeredQuestions || 0) - Number(a.answeredQuestions || 0)
    );
  }, [presentParticipants]);

  const totalPresent = presentParticipants.length;

  const totalDrinks = presentParticipants.reduce(
    (sum, person) => sum + Number(person.drinks || 0),
    0
  );

  const totalAnswered = presentParticipants.reduce(
    (sum, person) => sum + Number(person.answeredQuestions || 0),
    0
  );

  const towerSubtotal =
    Number(session.towers || 0) * Number(session.towerPrice || 0);

  const expensesTotal = session.expenses.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  const totalBill = towerSubtotal + expensesTotal;

  const perHead =
    totalPresent > 0 && totalBill > 0
      ? Number((totalBill / totalPresent).toFixed(2))
      : 0;

  const topDrinker = rankedParticipants[0];
  const topAnswerer = answeredRanking[0];

  const formatDateTime = (value) => {
    if (!value) return "Not set";

    return new Date(value).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const resetGameStorage = () => {
    localStorage.setItem("tagayrank-game", JSON.stringify(defaultGameState));
  };

  const resetCurrentSession = async () => {
    const confirmed = await confirmDialog({
      title: "Reset Full Session?",
      message:
        "This will reset attendance, drinks, game scores, towers, tower price, and expenses. Participants will stay saved.",
      variant: "danger",
      confirmText: "Reset Session",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    setParticipants((prev) =>
      prev.map((person) => ({
        ...person,
        present: false,
        drinks: 0,
        answeredQuestions: 0,
      }))
    );

    setSession(defaultSession());
    resetGameStorage();
  };

  const resetAttendanceOnly = async () => {
    const confirmed = await confirmDialog({
      title: "Reset Attendance?",
      message: "All participants will be marked as absent.",
      variant: "warning",
      confirmText: "Reset Attendance",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    setParticipants((prev) =>
      prev.map((person) => ({
        ...person,
        present: false,
      }))
    );
  };

  const resetDrinksOnly = async () => {
    const confirmed = await confirmDialog({
      title: "Reset Drinks?",
      message: "All participant drink counts will be set back to 0.",
      variant: "warning",
      confirmText: "Reset Drinks",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    setParticipants((prev) =>
      prev.map((person) => ({
        ...person,
        drinks: 0,
      }))
    );
  };

  const resetGameScoresOnly = async () => {
    const confirmed = await confirmDialog({
      title: "Reset Game Scores?",
      message: "All answered question counts will be set back to 0.",
      variant: "warning",
      confirmText: "Reset Scores",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    setParticipants((prev) =>
      prev.map((person) => ({
        ...person,
        answeredQuestions: 0,
      }))
    );
  };

  const clearExpensesOnly = async () => {
    const confirmed = await confirmDialog({
      title: "Clear Expenses?",
      message:
        "This will clear towers, tower price, and all other expenses for the current session.",
      variant: "warning",
      confirmText: "Clear Expenses",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    setSession((prev) => ({
      ...prev,
      towers: 0,
      towerPrice: "",
      expenseName: "",
      expensePrice: "",
      expenses: [],
    }));
  };

  const resetUsedGameQuestions = async () => {
    const confirmed = await confirmDialog({
      title: "Reset Used Questions?",
      message: "This allows previously shown game questions to appear again.",
      variant: "warning",
      confirmText: "Reset Questions",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    resetGameStorage();
  };

  const endSessionAndSaveToHistory = async () => {
    const confirmed = await confirmDialog({
      title: "End Session?",
      message:
        "This will save the current session to History, then reset attendance, drinks, game scores, towers, and expenses for a new session.",
      variant: "warning",
      confirmText: "Save & End Session",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    const endedAt = new Date().toISOString();

    const sessionRecord = {
      id: crypto.randomUUID(),
      sessionDate: new Date(session.startedAt).toISOString(),
      startedAt: session.startedAt,
      endedAt,

      totalPresent,
      totalDrinks,
      totalAnswered,

      towers: Number(session.towers || 0),
      towerPrice: Number(session.towerPrice || 0),
      towerSubtotal,

      expenses: session.expenses,
      expensesTotal,
      totalBill,
      perHead,

      topDrinker:
        topDrinker && Number(topDrinker.drinks || 0) > 0
          ? {
              id: topDrinker.id,
              name: topDrinker.nickname || topDrinker.firstName,
              fullName: `${topDrinker.firstName} ${
                topDrinker.middleName || ""
              } ${topDrinker.lastName}`,
              section: topDrinker.section,
              drinks: Number(topDrinker.drinks || 0),
              answeredQuestions: Number(topDrinker.answeredQuestions || 0),
              photo: topDrinker.photo || "",
            }
          : null,

      topAnswerer:
        topAnswerer && Number(topAnswerer.answeredQuestions || 0) > 0
          ? {
              id: topAnswerer.id,
              name: topAnswerer.nickname || topAnswerer.firstName,
              fullName: `${topAnswerer.firstName} ${
                topAnswerer.middleName || ""
              } ${topAnswerer.lastName}`,
              section: topAnswerer.section,
              drinks: Number(topAnswerer.drinks || 0),
              answeredQuestions: Number(topAnswerer.answeredQuestions || 0),
              photo: topAnswerer.photo || "",
            }
          : null,

      participants: presentParticipants.map((person) => ({
        id: person.id,
        firstName: person.firstName,
        middleName: person.middleName,
        lastName: person.lastName,
        nickname: person.nickname,
        section: person.section,
        bookingPinLocation: person.bookingPinLocation,
        drinks: Number(person.drinks || 0),
        answeredQuestions: Number(person.answeredQuestions || 0),
        present: person.present,
        photo: person.photo || "",
      })),

      ranking: rankedParticipants.map((person, index) => ({
        rank: index + 1,
        id: person.id,
        name: person.nickname || person.firstName,
        fullName: `${person.firstName} ${person.middleName || ""} ${
          person.lastName
        }`,
        section: person.section,
        drinks: Number(person.drinks || 0),
        answeredQuestions: Number(person.answeredQuestions || 0),
        photo: person.photo || "",
      })),

      answeredRanking: answeredRanking.map((person, index) => ({
        rank: index + 1,
        id: person.id,
        name: person.nickname || person.firstName,
        fullName: `${person.firstName} ${person.middleName || ""} ${
          person.lastName
        }`,
        section: person.section,
        drinks: Number(person.drinks || 0),
        answeredQuestions: Number(person.answeredQuestions || 0),
        photo: person.photo || "",
      })),
    };

    setHistory((prev) => [sessionRecord, ...prev]);

    setParticipants((prev) =>
      prev.map((person) => ({
        ...person,
        present: false,
        drinks: 0,
        answeredQuestions: 0,
      }))
    );

    setSession(defaultSession());
    resetGameStorage();
  };

  return (
    <div>
      {dialog}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Manage session controls, reset options, game scores, and history
            saving.
          </p>
        </div>

        <div className="glass-soft rounded-2xl px-4 py-3 w-full lg:w-auto">
          <p className="text-sm text-slate-700 font-bold">Session Started</p>
          <p className="text-xs text-slate-600">
            {formatDateTime(session.startedAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.8fr] gap-6">
        <div className="space-y-5">
          <div className="glass-soft rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <Save className="text-orange-500" size={22} />
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  End Session
                </h2>
                <p className="text-sm text-slate-600 font-medium">
                  Save current session to history, then start fresh.
                </p>
              </div>
            </div>

            <div className="bg-white/45 rounded-2xl p-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">
                    Start Time
                  </p>
                  <p className="text-sm text-slate-800 font-semibold mt-1">
                    {formatDateTime(session.startedAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">
                    Current Time
                  </p>
                  <p className="text-sm text-slate-800 font-semibold mt-1">
                    {formatDateTime(new Date().toISOString())}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={endSessionAndSaveToHistory}
              className="btn-primary w-full inline-flex items-center justify-center gap-2"
            >
              <Save size={18} />
              End Session & Save to History
            </button>
          </div>

          <div className="glass-soft rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <RotateCcw className="text-orange-500" size={22} />
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Reset Controls
                </h2>
                <p className="text-sm text-slate-600 font-medium">
                  Reset parts of the current session without deleting
                  participants.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={resetCurrentSession}
                className="bg-red-500 text-white rounded-2xl p-4 font-bold inline-flex items-center justify-center gap-2 hover:bg-red-600 transition"
              >
                <AlertTriangle size={18} />
                Reset Full Session
              </button>

              <button
                onClick={resetAttendanceOnly}
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                <UserX size={18} />
                Reset Attendance
              </button>

              <button
                onClick={resetDrinksOnly}
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                <Beer size={18} />
                Reset Drinks
              </button>

              <button
                onClick={resetGameScoresOnly}
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                <Gamepad2 size={18} />
                Reset Game Scores
              </button>

              <button
                onClick={clearExpensesOnly}
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                <ReceiptText size={18} />
                Clear Expenses
              </button>

              <button
                onClick={resetUsedGameQuestions}
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                Reset Used Questions
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-soft rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <Clock className="text-orange-500" size={22} />
              <h2 className="text-xl font-extrabold text-slate-900">
                Current Summary
              </h2>
            </div>

            <div className="space-y-3">
              <div className="bg-white/45 rounded-2xl p-4 flex items-center justify-between">
                <p className="text-sm text-slate-600 font-semibold">
                  Present
                </p>
                <p className="text-xl font-extrabold text-slate-900">
                  {totalPresent}
                </p>
              </div>

              <div className="bg-white/45 rounded-2xl p-4 flex items-center justify-between">
                <p className="text-sm text-slate-600 font-semibold">
                  Total Drinks
                </p>
                <p className="text-xl font-extrabold text-orange-600">
                  {totalDrinks}
                </p>
              </div>

              <div className="bg-white/45 rounded-2xl p-4 flex items-center justify-between">
                <p className="text-sm text-slate-600 font-semibold">
                  Answered Questions
                </p>
                <p className="text-xl font-extrabold text-slate-900">
                  {totalAnswered}
                </p>
              </div>

              <div className="bg-white/45 rounded-2xl p-4 flex items-center justify-between">
                <p className="text-sm text-slate-600 font-semibold">
                  Towers
                </p>
                <p className="text-xl font-extrabold text-slate-900">
                  {session.towers}
                </p>
              </div>

              <div className="bg-white/45 rounded-2xl p-4 flex items-center justify-between">
                <p className="text-sm text-slate-600 font-semibold">
                  Total Bill
                </p>
                <p className="text-xl font-extrabold text-orange-600">
                  ₱{totalBill.toFixed(2)}
                </p>
              </div>

              <div className="bg-white/45 rounded-2xl p-4 flex items-center justify-between">
                <p className="text-sm text-slate-600 font-semibold">
                  Per Head
                </p>
                <p className="text-xl font-extrabold text-slate-900">
                  ₱{perHead.toFixed(2)}
                </p>
              </div>

              <div className="bg-white/45 rounded-2xl p-4">
                <p className="text-sm text-slate-600 font-semibold">
                  Top Drinker
                </p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {topDrinker && Number(topDrinker.drinks || 0) > 0
                    ? `${topDrinker.nickname || topDrinker.firstName} (${
                        topDrinker.drinks
                      })`
                    : "No one yet"}
                </p>
              </div>

              <div className="bg-white/45 rounded-2xl p-4">
                <p className="text-sm text-slate-600 font-semibold">
                  Top Answerer
                </p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {topAnswerer &&
                  Number(topAnswerer.answeredQuestions || 0) > 0
                    ? `${topAnswerer.nickname || topAnswerer.firstName} (${
                        topAnswerer.answeredQuestions
                      })`
                    : "No one yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-soft rounded-3xl p-5">
            <h2 className="text-xl font-extrabold text-slate-900 mb-3">
              Saved Sessions
            </h2>

            <p className="text-sm text-slate-700 font-medium">
              {history.length} session{history.length === 1 ? "" : "s"} saved
              in history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}