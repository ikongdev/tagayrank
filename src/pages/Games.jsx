import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Beer,
  CheckCircle2,
  Gamepad2,
  RotateCw,
  Sparkles,
  Trophy,
  Users,
  X,
  Shuffle,
  Flame,
} from "lucide-react";
import {
  answerOrDrinkQuestions,
  darePrompts,
  truthQuestions,
} from "../data/gameQuestions";
import {
  extremeAnswerOrDrinkQuestions,
  extremeDarePrompts,
  extremeTruthQuestions,
} from "../data/extremeQuestions";
import { useAppDialog } from "../components/AppDialog";

const wheelColors = [
  "#fb923c",
  "#f97316",
  "#fdba74",
  "#f59e0b",
  "#fed7aa",
  "#ea580c",
  "#ffedd5",
  "#fb7185",
];

const EXTREME_WEIGHT = 8;

const defaultGameState = {
  usedTruthIds: [],
  usedDareIds: [],
  usedAnswerIds: [],
  pickedParticipantIds: [],
  fairTurnMode: true,
  extremeMode: false,
};

const buildWeightedQuestionPool = (
  normalQuestions,
  extremeQuestions,
  extremeMode
) => {
  if (!extremeMode) return normalQuestions;

  return [
    ...normalQuestions,
    ...Array.from({ length: EXTREME_WEIGHT }).flatMap(
      () => extremeQuestions
    ),
  ];
};

export default function Games() {
  const [participants, setParticipants] = useState(() => {
    const saved = localStorage.getItem("tagayrank-participants");

    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem("tagayrank-game");

    try {
      return saved
        ? {
            ...defaultGameState,
            ...JSON.parse(saved),
          }
        : defaultGameState;
    } catch {
      return defaultGameState;
    }
  });

  const [mode, setMode] = useState("truthOrDare");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [modalStep, setModalStep] = useState("picked");
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [cardRevealed, setCardRevealed] = useState(false);

  const { dialog, confirmDialog } = useAppDialog();

  useEffect(() => {
    localStorage.setItem(
      "tagayrank-participants",
      JSON.stringify(participants)
    );
  }, [participants]);

  useEffect(() => {
    localStorage.setItem("tagayrank-game", JSON.stringify(gameState));
  }, [gameState]);

  const presentParticipants = useMemo(() => {
    return participants.filter((person) => person.present);
  }, [participants]);

  const truthPool = useMemo(() => {
    return buildWeightedQuestionPool(
      truthQuestions,
      extremeTruthQuestions,
      gameState.extremeMode
    );
  }, [gameState.extremeMode]);

  const darePool = useMemo(() => {
    return buildWeightedQuestionPool(
      darePrompts,
      extremeDarePrompts,
      gameState.extremeMode
    );
  }, [gameState.extremeMode]);

  const answerPool = useMemo(() => {
    return buildWeightedQuestionPool(
      answerOrDrinkQuestions,
      extremeAnswerOrDrinkQuestions,
      gameState.extremeMode
    );
  }, [gameState.extremeMode]);

  const validPickedParticipantIds = useMemo(() => {
    const presentIds = new Set(presentParticipants.map((person) => person.id));

    return (gameState.pickedParticipantIds || []).filter((id) =>
      presentIds.has(id)
    );
  }, [gameState.pickedParticipantIds, presentParticipants]);

  const remainingParticipants = useMemo(() => {
    if (!gameState.fairTurnMode) return presentParticipants;

    const pickedIds = new Set(validPickedParticipantIds);

    return presentParticipants.filter((person) => !pickedIds.has(person.id));
  }, [gameState.fairTurnMode, presentParticipants, validPickedParticipantIds]);

  const activeSpinPool = useMemo(() => {
    if (!gameState.fairTurnMode) return presentParticipants;

    return remainingParticipants.length > 0
      ? remainingParticipants
      : presentParticipants;
  }, [gameState.fairTurnMode, presentParticipants, remainingParticipants]);

  const totalAnswered = presentParticipants.reduce(
    (sum, person) => sum + Number(person.answeredQuestions || 0),
    0
  );

  const wheelGradient = useMemo(() => {
    if (presentParticipants.length === 0) {
      return "conic-gradient(#fed7aa 0deg 360deg)";
    }

    const segment = 360 / presentParticipants.length;

    return `conic-gradient(${presentParticipants
      .map((_, index) => {
        const start = index * segment;
        const end = (index + 1) * segment;
        const color = wheelColors[index % wheelColors.length];

        return `${color} ${start}deg ${end}deg`;
      })
      .join(", ")})`;
  }, [presentParticipants]);

  const getInitials = (person) => {
    const first = person.firstName?.charAt(0) || "";
    const last = person.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "T";
  };

  const getDisplayName = (person) => {
    return person.nickname || person.firstName || "Player";
  };

  const getWheelLabelPosition = (index, total) => {
    if (total === 0) {
      return {
        left: "50%",
        top: "50%",
      };
    }

    const segment = 360 / total;
    const angle = (index + 0.5) * segment - 90;
    const radius = 33;
    const radians = (angle * Math.PI) / 180;

    return {
      left: `${50 + radius * Math.cos(radians)}%`,
      top: `${50 + radius * Math.sin(radians)}%`,
    };
  };

  const getRandomPrompt = (pool, usedKey) => {
    const usedIds = gameState[usedKey] || [];
    const available = pool.filter((item) => !usedIds.includes(item.id));
    const source = available.length > 0 ? available : pool;
    const picked = source[Math.floor(Math.random() * source.length)];

    setGameState((prev) => ({
      ...prev,
      [usedKey]: available.length > 0 ? [...usedIds, picked.id] : [picked.id],
    }));

    return picked;
  };

  const updateTurnPoolAfterPick = (selectedId) => {
    if (!gameState.fairTurnMode) return;

    setGameState((prev) => {
      const presentIds = new Set(presentParticipants.map((person) => person.id));
      const cleanedPickedIds = (prev.pickedParticipantIds || []).filter((id) =>
        presentIds.has(id)
      );

      const cleanedPickedSet = new Set(cleanedPickedIds);
      const remainingBeforePick = presentParticipants.filter(
        (person) => !cleanedPickedSet.has(person.id)
      );

      const shouldStartNewRound = remainingBeforePick.length === 0;

      if (cleanedPickedIds.includes(selectedId) && !shouldStartNewRound) {
        return prev;
      }

      return {
        ...prev,
        pickedParticipantIds: shouldStartNewRound
          ? [selectedId]
          : [...cleanedPickedIds, selectedId],
      };
    });
  };

  const startSpin = () => {
    if (spinning || presentParticipants.length === 0) return;

    const sourcePool =
      activeSpinPool.length > 0 ? activeSpinPool : presentParticipants;

    const selectedFromPoolIndex = Math.floor(Math.random() * sourcePool.length);
    const selected = sourcePool[selectedFromPoolIndex];

    const selectedIndex = presentParticipants.findIndex(
      (person) => person.id === selected.id
    );

    if (selectedIndex === -1) return;

    const segment = 360 / presentParticipants.length;
    const selectedCenter = selectedIndex * segment + segment / 2;
    const currentRotation = rotation % 360;
    const correction = (360 - selectedCenter - currentRotation + 360) % 360;
    const spinAmount = 1440 + correction;

    setSpinning(true);
    setCurrentPrompt(null);
    setSelectedParticipant(null);
    setCardRevealed(false);
    setModalStep("picked");
    setRotation((prev) => prev + spinAmount);

    setTimeout(() => {
      setSelectedParticipant(selected);
      setModalStep("picked");
      setSpinning(false);
    }, 2500);
  };

  const handleReSpin = () => {
    setSelectedParticipant(null);
    setCurrentPrompt(null);
    setCardRevealed(false);
    setModalStep("picked");

    setTimeout(() => {
      startSpin();
    }, 80);
  };

  const revealCard = () => {
    let prompt;

    if (mode === "truthOrDare") {
      const randomType = Math.random() < 0.5 ? "Truth" : "Dare";

      if (randomType === "Truth") {
        prompt = {
          ...getRandomPrompt(truthPool, "usedTruthIds"),
          promptType: "Truth",
        };
      } else {
        prompt = {
          ...getRandomPrompt(darePool, "usedDareIds"),
          promptType: "Dare",
        };
      }
    } else {
      prompt = {
        ...getRandomPrompt(answerPool, "usedAnswerIds"),
        promptType: "Question",
      };
    }

    setCurrentPrompt(prompt);
    setCardRevealed(false);
    setModalStep("question");

    setTimeout(() => {
      setCardRevealed(true);
    }, 100);
  };

  const closeModal = () => {
    setSelectedParticipant(null);
    setCurrentPrompt(null);
    setCardRevealed(false);
    setModalStep("picked");
  };

  const answerPrompt = () => {
    if (!selectedParticipant) return;

    updateTurnPoolAfterPick(selectedParticipant.id);

    setParticipants((prev) =>
      prev.map((person) =>
        person.id === selectedParticipant.id
          ? {
              ...person,
              answeredQuestions: Number(person.answeredQuestions || 0) + 1,
            }
          : person
      )
    );

    closeModal();
  };

  const drinkInstead = () => {
    if (!selectedParticipant) return;

    updateTurnPoolAfterPick(selectedParticipant.id);

    setParticipants((prev) =>
      prev.map((person) =>
        person.id === selectedParticipant.id
          ? {
              ...person,
              drinks: Number(person.drinks || 0) + 1,
            }
          : person
      )
    );

    closeModal();
  };

  const resetUsedQuestions = async () => {
    const confirmed = await confirmDialog({
      title: "Reset Used Questions?",
      message: "Previously shown game questions may appear again after this.",
      variant: "warning",
      confirmText: "Reset Questions",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    setGameState((prev) => ({
      ...prev,
      usedTruthIds: [],
      usedDareIds: [],
      usedAnswerIds: [],
    }));
  };

  const resetTurnPool = async () => {
    const confirmed = await confirmDialog({
      title: "Reset Turn Pool?",
      message:
        "Everyone will become available again in Fair Turn Mode. Scores and drinks will not be changed.",
      variant: "warning",
      confirmText: "Reset Pool",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    setGameState((prev) => ({
      ...prev,
      pickedParticipantIds: [],
    }));
  };

  const toggleFairTurnMode = () => {
    setGameState((prev) => ({
      ...prev,
      fairTurnMode: !prev.fairTurnMode,
      pickedParticipantIds: [],
    }));
  };

  const toggleExtremeMode = () => {
    setGameState((prev) => ({
      ...prev,
      extremeMode: !prev.extremeMode,
    }));
  };

  const remainingThisRound = gameState.fairTurnMode
    ? remainingParticipants.length === 0 && presentParticipants.length > 0
      ? presentParticipants.length
      : remainingParticipants.length
    : presentParticipants.length;

  const primaryActionLabel =
    currentPrompt?.promptType === "Dare" ? "Done" : "Answer";

  return (
    <div>
      {dialog}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Games</h1>
          <p className="page-subtitle">
            Spin the wheel, reveal a random card, then answer, finish, or drink.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetTurnPool}
            className="btn-secondary inline-flex items-center justify-center gap-2"
          >
            <Shuffle size={18} />
            Reset Turn Pool
          </button>

          <button
            onClick={resetUsedQuestions}
            className="btn-secondary inline-flex items-center justify-center gap-2"
          >
            <RotateCw size={18} />
            Reset Used Questions
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <div className="glass-soft rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">
                Present Players
              </p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                {presentParticipants.length}
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
              <p className="text-sm text-slate-600 font-semibold">Answered</p>
              <h2 className="text-3xl font-extrabold text-orange-600 mt-1">
                {totalAnswered}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        <div className="glass-soft rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Mode</p>
              <h2 className="text-lg font-extrabold text-slate-900 mt-2">
                {mode === "truthOrDare" ? "Truth or Dare" : "Answer or Drink"}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center text-slate-700">
              <Gamepad2 size={22} />
            </div>
          </div>
        </div>

        <div className="glass-soft rounded-3xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Turn Pool</p>
              <h2 className="text-lg font-extrabold text-slate-900 mt-2">
                {gameState.fairTurnMode
                  ? `${remainingThisRound} left`
                  : "Random"}
              </h2>
            </div>

            <button
              onClick={toggleFairTurnMode}
              className={`rounded-2xl px-3 py-2 text-xs font-extrabold transition ${
                gameState.fairTurnMode
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-white/60 text-slate-800 hover:bg-white/80"
              }`}
            >
              {gameState.fairTurnMode ? "Fair ON" : "Fair OFF"}
            </button>
          </div>
        </div>

        <div className="glass-soft rounded-3xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Extreme</p>
              <h2 className="text-lg font-extrabold text-slate-900 mt-2">
                {gameState.extremeMode ? "HIGH" : "OFF"}
              </h2>
            </div>

            <button
              onClick={toggleExtremeMode}
              className={`rounded-2xl px-3 py-2 text-xs font-extrabold transition ${
                gameState.extremeMode
                  ? "bg-red-500 text-white shadow-lg"
                  : "bg-white/60 text-slate-800 hover:bg-white/80"
              }`}
            >
              <Flame size={14} className="inline mr-1" />
              {gameState.extremeMode ? "Off" : "On"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-soft rounded-3xl p-5 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={() => setMode("truthOrDare")}
              className={`flex-1 rounded-2xl py-3 px-4 font-bold transition ${
                mode === "truthOrDare"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-white/60 text-slate-800 hover:bg-white/80"
              }`}
            >
              Truth or Dare
            </button>

            <button
              onClick={() => setMode("answerOrDrink")}
              className={`flex-1 rounded-2xl py-3 px-4 font-bold transition ${
                mode === "answerOrDrink"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-white/60 text-slate-800 hover:bg-white/80"
              }`}
            >
              Answer or Drink
            </button>
          </div>

          <div
            className={`rounded-2xl p-4 mb-6 ${
              gameState.extremeMode ? "bg-red-500/10" : "bg-white/45"
            }`}
          >
            <p
              className={`text-sm font-bold ${
                gameState.extremeMode ? "text-red-700" : "text-slate-800"
              }`}
            >
              Extreme Questions are {gameState.extremeMode ? "HIGH" : "OFF"}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {gameState.extremeMode
                ? "Extreme mode is weighted higher, so intense, personal, spicy, and dark cards are more likely to appear."
                : "Turn on Extreme Questions if the group wants a more intense round."}
            </p>
          </div>

          <div className="bg-white/45 rounded-2xl p-4 mb-6">
            <p className="text-sm font-bold text-slate-800">
              Fair Turn Mode is {gameState.fairTurnMode ? "ON" : "OFF"}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {gameState.fairTurnMode
                ? "Players will not repeat until everyone present has answered, completed a dare, or taken a drink."
                : "Pure random mode is active, so the same player can be picked again anytime."}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <div
                className="absolute left-1/2 -top-2 -translate-x-1/2 z-10"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "14px solid transparent",
                  borderRight: "14px solid transparent",
                  borderTop: "26px solid #ea580c",
                }}
              />

              <div
                className="absolute inset-0 rounded-full border-8 border-white/70 shadow-2xl overflow-hidden transition-transform ease-out"
                style={{
                  background: wheelGradient,
                  transform: `rotate(${rotation}deg)`,
                  transitionDuration: "2500ms",
                }}
              >
                {presentParticipants.map((person, index) => {
                  const position = getWheelLabelPosition(
                    index,
                    presentParticipants.length
                  );

                  return (
                    <div
                      key={person.id}
                      title={getDisplayName(person)}
                      className="
                        absolute
                        max-w-24
                        px-2
                        py-1
                        rounded-full
                        bg-white/80
                        text-slate-900
                        text-xs
                        font-extrabold
                        shadow-sm
                        text-center
                        truncate
                        border
                        border-white/50
                      "
                      style={{
                        left: position.left,
                        top: position.top,
                        transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
                        transition: "transform 2500ms ease-out",
                      }}
                    >
                      {getDisplayName(person)}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={startSpin}
                disabled={spinning || presentParticipants.length === 0}
                className="absolute inset-0 m-auto w-28 h-28 rounded-full bg-white text-orange-600 shadow-2xl font-extrabold flex flex-col items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RotateCw
                  size={26}
                  className={spinning ? "animate-spin" : ""}
                />
                SPIN
              </button>
            </div>

            {presentParticipants.length === 0 ? (
              <p className="text-center text-slate-700 font-medium mt-6">
                No present participants yet. Go to Attendance and mark players
                as Present first.
              </p>
            ) : (
              <p className="text-center text-slate-700 font-medium mt-6">
                Spin the wheel, then tap the hidden card to reveal.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-soft rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <Trophy className="text-orange-500" size={22} />
              <h2 className="text-xl font-extrabold text-slate-900">
                Game Cards
              </h2>
            </div>

            {presentParticipants.length === 0 ? (
              <p className="text-sm text-slate-700 font-medium">
                No present participants yet.
              </p>
            ) : (
              <div className="space-y-3">
                {presentParticipants.map((person) => {
                  const alreadyPicked =
                    gameState.fairTurnMode &&
                    validPickedParticipantIds.includes(person.id);

                  return (
                    <div
                      key={person.id}
                      className={`rounded-2xl p-3 flex items-center justify-between gap-3 ${
                        alreadyPicked ? "bg-white/25" : "bg-white/45"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
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
                          <p className="text-xs text-slate-600 truncate">
                            {person.section}
                          </p>
                          {gameState.fairTurnMode && (
                            <p
                              className={`text-xs font-bold mt-1 ${
                                alreadyPicked
                                  ? "text-slate-500"
                                  : "text-orange-600"
                              }`}
                            >
                              {alreadyPicked
                                ? "Picked this round"
                                : "Available"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-center">
                          <p className="text-xs text-slate-500 font-bold">
                            Ans
                          </p>
                          <p className="font-extrabold text-slate-900">
                            {person.answeredQuestions || 0}
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-xs text-slate-500 font-bold">
                            Drink
                          </p>
                          <p className="font-extrabold text-orange-600">
                            {person.drinks || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass-soft rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="text-orange-500" size={22} />
              <h2 className="text-xl font-extrabold text-slate-900">Rules</h2>
            </div>

            <div className="space-y-2 text-sm text-slate-700 font-medium">
              <p>
                Truth or Dare: spin, tap the card, then answer, finish
                the dare, or drink.
              </p>
              <p>
                Answer or Drink: spin, tap the question card, then answer or
                drink.
              </p>
              <p>
                Answer/Done adds +1 to answered questions. Drink adds +1 to
                drink count.
              </p>
              <p>
                Fair Turn Mode prevents repeat picks until everyone present has
                completed a turn once.
              </p>
              <p>
                Extreme Questions are weighted higher when enabled, so intense
                prompts are more likely to appear.
              </p>
            </div>
          </div>
        </div>
      </div>

      {selectedParticipant &&
        createPortal(
          <div className="fixed inset-0 z-9999 bg-black/25 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
            <div className="glass-card w-full max-w-xl rounded-4xl p-6 md:p-7 max-h-[90vh] overflow-y-auto no-scrollbar my-auto">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 min-w-0">
                  {selectedParticipant.photo ? (
                    <img
                      src={selectedParticipant.photo}
                      alt={
                        selectedParticipant.nickname ||
                        selectedParticipant.firstName
                      }
                      className="w-16 h-16 rounded-3xl object-cover border border-white/60 shadow-lg shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-3xl bg-orange-500/15 text-orange-600 flex items-center justify-center font-extrabold text-xl shadow-sm shrink-0">
                      {getInitials(selectedParticipant)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="text-2xl font-extrabold text-slate-900 truncate">
                      {selectedParticipant.nickname ||
                        selectedParticipant.firstName}
                    </h2>

                    <p className="text-sm text-slate-700 font-medium">
                      {selectedParticipant.section}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center text-slate-800 hover:bg-white/80 shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {modalStep === "picked" && (
                <div>
                  <div className="bg-white/45 rounded-3xl p-5 text-center mb-5">
                    <p className="text-sm text-slate-600 font-semibold">
                      The wheel picked
                    </p>
                    <h3 className="text-3xl font-extrabold text-orange-600 mt-1">
                      {selectedParticipant.nickname ||
                        selectedParticipant.firstName}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={revealCard}
                    className="relative mb-5 w-full text-left group"
                    style={{
                      perspective: "1200px",
                      minHeight: "260px",
                    }}
                  >
                    <div className="absolute inset-0 rounded-3xl bg-orange-500 text-white shadow-xl flex flex-col items-center justify-center text-center p-6 border border-white/50 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl active:scale-95">
                      <Sparkles size={40} />

                      <h3 className="text-2xl font-extrabold mt-4">
                        Hidden Card
                      </h3>

                      <p className="text-sm text-white/85 font-medium mt-2">
                        Tap or click this card to reveal.
                      </p>

                      <div className="mt-5 rounded-full bg-white/20 px-4 py-2 text-xs font-extrabold uppercase tracking-wide">
                        Reveal
                      </div>
                    </div>
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleReSpin}
                      disabled={spinning}
                      className="btn-secondary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCw size={18} />
                      Re-spin
                    </button>

                    <button
                      onClick={closeModal}
                      className="bg-white/50 text-slate-800 rounded-2xl px-4 py-3 font-bold hover:bg-white/70 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {modalStep === "question" && currentPrompt && (
                <div>
                  <div
                    className="relative mb-5"
                    style={{
                      perspective: "1200px",
                      minHeight: "380px",
                    }}
                  >
                    <div
                      className="absolute inset-0 transition-transform duration-700"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: cardRevealed
                          ? "rotateY(180deg)"
                          : "rotateY(0deg)",
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-3xl bg-orange-500 text-white shadow-xl flex flex-col items-center justify-center text-center p-6 border border-white/50"
                        style={{
                          backfaceVisibility: "hidden",
                        }}
                      >
                        <Sparkles size={38} />

                        <h3 className="text-2xl font-extrabold mt-4">
                          Revealing Card
                        </h3>

                        <p className="text-sm text-white/85 font-medium mt-2">
                          Get ready...
                        </p>
                      </div>

                      <div
                        className={`absolute inset-0 rounded-3xl p-5 overflow-y-auto no-scrollbar shadow-xl border border-white/50 ${
                          currentPrompt.category?.includes("Extreme")
                            ? "bg-red-500/10"
                            : "bg-white/70"
                        }`}
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span
                            className={`text-white rounded-full px-3 py-1 text-xs font-bold ${
                              currentPrompt.category?.includes("Extreme")
                                ? "bg-red-500"
                                : "bg-orange-500"
                            }`}
                          >
                            {currentPrompt.promptType}
                          </span>

                          <span className="bg-white/80 text-slate-700 rounded-full px-3 py-1 text-xs font-bold">
                            {currentPrompt.category}
                          </span>
                        </div>

                        <h3 className="text-2xl font-extrabold text-slate-900 leading-snug">
                          {currentPrompt.text}
                        </h3>

                        <p className="text-slate-700 italic mt-4 leading-relaxed">
                          {currentPrompt.translation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {cardRevealed && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={answerPrompt}
                        className="btn-primary inline-flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={18} />
                        {primaryActionLabel}
                      </button>

                      <button
                        onClick={drinkInstead}
                        className="btn-secondary inline-flex items-center justify-center gap-2"
                      >
                        <Beer size={18} />
                        Drink
                      </button>

                      <button
                        onClick={handleReSpin}
                        disabled={spinning}
                        className="sm:col-span-2 bg-white/50 text-slate-800 rounded-2xl px-4 py-3 font-bold hover:bg-white/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Re-spin Instead
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}