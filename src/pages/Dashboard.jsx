import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Beer,
  Trophy,
  Users,
  Plus,
  Minus,
  X,
  MapPin,
  Wallet,
  BarChart3,
  Crown,
  Flame,
  Trash2,
  ReceiptText,
  Search,
} from "lucide-react";

export default function Dashboard() {
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

    const defaultSession = {
      towers: 0,
      towerPrice: "",
      expenseName: "",
      expensePrice: "",
      expenses: [],
      startedAt: new Date().toISOString(),
    };

    try {
      return saved
        ? {
            ...defaultSession,
            ...JSON.parse(saved),
          }
        : defaultSession;
    } catch {
      return defaultSession;
    }
  });

  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "tagayrank-participants",
      JSON.stringify(participants)
    );
  }, [participants]);

  useEffect(() => {
    localStorage.setItem("tagayrank-session", JSON.stringify(session));
  }, [session]);

  const presentParticipants = useMemo(() => {
    return participants.filter((person) => person.present);
  }, [participants]);

  const filteredPresentParticipants = useMemo(() => {
    return presentParticipants.filter((person) => {
      const searchableText = `
        ${person.firstName}
        ${person.middleName}
        ${person.lastName}
        ${person.nickname}
        ${person.section}
        ${person.bookingPinLocation}
      `.toLowerCase();

      return searchableText.includes(search.toLowerCase());
    });
  }, [presentParticipants, search]);

  const rankedParticipants = useMemo(() => {
    return [...presentParticipants].sort(
      (a, b) => Number(b.drinks || 0) - Number(a.drinks || 0)
    );
  }, [presentParticipants]);

  const totalPresent = presentParticipants.length;

  const totalDrinks = presentParticipants.reduce(
    (sum, person) => sum + Number(person.drinks || 0),
    0
  );

  const averageDrinks =
    totalPresent > 0 ? (totalDrinks / totalPresent).toFixed(1) : "0.0";

  const topDrinker = rankedParticipants[0];

  const lowestDrinker =
    rankedParticipants.length > 0
      ? [...rankedParticipants].sort(
          (a, b) => Number(a.drinks || 0) - Number(b.drinks || 0)
        )[0]
      : null;

  const towerSubtotal =
    Number(session.towers || 0) * Number(session.towerPrice || 0);

  const expensesTotal = session.expenses.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  const totalBillNumber = towerSubtotal + expensesTotal;

  const perHead =
    totalPresent > 0 && totalBillNumber > 0
      ? (totalBillNumber / totalPresent).toFixed(2)
      : "0.00";

  const getInitials = (person) => {
    const first = person.firstName?.charAt(0) || "";
    const last = person.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "T";
  };

  const updateDrink = (id, amount) => {
    setParticipants((prev) =>
      prev.map((person) =>
        person.id === id
          ? {
              ...person,
              drinks: Math.max(0, Number(person.drinks || 0) + amount),
            }
          : person
      )
    );

    setSelectedParticipant((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            drinks: Math.max(0, Number(prev.drinks || 0) + amount),
          }
        : prev
    );
  };

  const updateTowers = (amount) => {
    setSession((prev) => ({
      ...prev,
      towers: Math.max(0, Number(prev.towers || 0) + amount),
    }));
  };

  const handleExpenseChange = (e) => {
    setSession((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const addExpense = () => {
    if (!session.expenseName || !session.expensePrice) {
      alert("Please enter item name and price.");
      return;
    }

    const newExpense = {
      id: crypto.randomUUID(),
      name: session.expenseName,
      price: Number(session.expensePrice),
    };

    setSession((prev) => ({
      ...prev,
      expenses: [...prev.expenses, newExpense],
      expenseName: "",
      expensePrice: "",
    }));
  };

  const deleteExpense = (id) => {
    setSession((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((item) => item.id !== id),
    }));
  };

  const getBadges = (person) => {
    const badges = [];
    const drinks = Number(person.drinks || 0);

    if (topDrinker && person.id === topDrinker.id && drinks > 0) {
      badges.push("🏆 Top Drinker");
    }

    if (drinks === 0) {
      badges.push("😇 Sober Hero");
    }

    if (drinks >= 10) {
      badges.push("🍺 Tower Destroyer");
    }

    if (drinks >= 20) {
      badges.push("💀 Walking Brewery");
    }

    if (drinks >= 30) {
      badges.push("👑 King of Tagay");
    }

    return badges;
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Track drinks, towers, rankings, ambagan, and session stats.
          </p>
        </div>

        <div className="glass-soft rounded-2xl px-4 py-3 w-full lg:w-auto">
          <p className="text-sm text-slate-700 font-bold">Current Session</p>
          <p className="text-xs text-slate-600">Present participants only</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="glass-soft rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Present</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                {totalPresent}
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
                Total Drinks
              </p>
              <h2 className="text-3xl font-extrabold text-orange-600 mt-1">
                {totalDrinks}
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
              <p className="text-sm text-slate-600 font-semibold">Towers</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                {session.towers}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center text-slate-700">
              🍻
            </div>
          </div>
        </div>

        <div className="glass-soft rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Average</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                {averageDrinks}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center text-slate-700">
              <BarChart3 size={22} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-6">
        <div>
          <div className="glass-soft rounded-3xl p-4 mb-5">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Search present participants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-ui input-search"
              />
            </div>
          </div>

          {presentParticipants.length === 0 ? (
            <div className="glass-soft rounded-3xl p-10 text-center">
              <h2 className="text-xl font-bold text-slate-900">
                No present participants yet
              </h2>
              <p className="text-slate-700 mt-2 font-medium">
                Go to Attendance and mark participants as Present first.
              </p>
            </div>
          ) : filteredPresentParticipants.length === 0 ? (
            <div className="glass-soft rounded-3xl p-10 text-center">
              <h2 className="text-xl font-bold text-slate-900">
                No matching participants
              </h2>
              <p className="text-slate-700 mt-2 font-medium">
                Try searching another name, nickname, section, or location.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
              {filteredPresentParticipants.map((person) => {
                const badges = getBadges(person);

                return (
                  <button
                    key={person.id}
                    onClick={() => setSelectedParticipant(person)}
                    className="glass-soft rounded-3xl p-5 text-left transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        {person.photo ? (
                          <img
                            src={person.photo}
                            alt={person.nickname || person.firstName}
                            className="w-14 h-14 rounded-2xl object-cover border border-white/50 shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-orange-500/15 text-orange-600 flex items-center justify-center font-extrabold shadow-sm shrink-0">
                            {getInitials(person)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h2 className="text-xl font-extrabold text-slate-900 truncate">
                            {person.nickname || person.firstName}
                          </h2>

                          <p className="text-sm text-slate-700 mt-1 font-medium truncate">
                            {person.section}
                          </p>
                        </div>
                      </div>

                      <div className="bg-orange-500 text-white rounded-2xl px-3 py-2 text-sm font-bold flex items-center gap-2 shadow-lg shrink-0">
                        <Beer size={16} />
                        {person.drinks}
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">
                        Full Name
                      </p>
                      <p className="text-sm text-slate-800 mt-1 font-medium">
                        {person.firstName} {person.middleName} {person.lastName}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-5">
                      {badges.slice(0, 2).map((badge) => (
                        <span
                          key={badge}
                          className="bg-white/60 text-slate-800 px-3 py-1 rounded-full text-xs font-bold"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="glass-soft rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <Trophy className="text-orange-500" size={22} />
              <h2 className="text-xl font-extrabold text-slate-900">
                Ranking
              </h2>
            </div>

            {rankedParticipants.length === 0 ? (
              <p className="text-sm text-slate-700 font-medium">
                No ranking yet.
              </p>
            ) : (
              <div className="space-y-3">
                {rankedParticipants.slice(0, 8).map((person, index) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between bg-white/45 rounded-2xl p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {person.photo ? (
                        <img
                          src={person.photo}
                          alt={person.nickname || person.firstName}
                          className="w-10 h-10 rounded-xl object-cover border border-white/50 shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center font-extrabold text-slate-800 shrink-0">
                          {index === 0
                            ? "🥇"
                            : index === 1
                            ? "🥈"
                            : index === 2
                            ? "🥉"
                            : index + 1}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {index === 0
                            ? "🥇 "
                            : index === 1
                            ? "🥈 "
                            : index === 2
                            ? "🥉 "
                            : `${index + 1}. `}
                          {person.nickname || person.firstName}
                        </p>
                        <p className="text-xs text-slate-600 truncate">
                          {person.section}
                        </p>
                      </div>
                    </div>

                    <div className="font-extrabold text-orange-600 shrink-0">
                      {person.drinks}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-soft rounded-3xl p-5">
            <h2 className="text-xl font-extrabold text-slate-900 mb-5">
              Tower Counter
            </h2>

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => updateTowers(-1)}
                className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center text-slate-800 hover:bg-white/80"
              >
                <Minus size={18} />
              </button>

              <div className="text-center">
                <p className="text-5xl font-extrabold text-slate-900">
                  {session.towers}
                </p>
                <p className="text-sm text-slate-600 font-medium">
                  towers consumed
                </p>
              </div>

              <button
                onClick={() => updateTowers(1)}
                className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg hover:bg-orange-600"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="glass-soft rounded-3xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <Wallet className="text-orange-500" size={22} />
              <h2 className="text-xl font-extrabold text-slate-900">
                Ambagan
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-700 font-bold">
                  Tower Price
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="Price per tower"
                  value={session.towerPrice}
                  onChange={(e) =>
                    setSession((prev) => ({
                      ...prev,
                      towerPrice: e.target.value,
                    }))
                  }
                  className="input-ui mt-2"
                />

                <div className="bg-white/45 rounded-2xl p-4 mt-3">
                  <p className="text-sm text-slate-600 font-semibold">
                    Tower Subtotal
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                    ₱{towerSubtotal.toFixed(2)}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {session.towers} tower
                    {session.towers === 1 ? "" : "s"} × ₱
                    {Number(session.towerPrice || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="h-px bg-white/40" />

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ReceiptText size={18} className="text-orange-500" />
                  <h3 className="font-extrabold text-slate-900">
                    Other Expenses
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
                  <input
                    name="expenseName"
                    type="text"
                    placeholder="Item name"
                    value={session.expenseName}
                    onChange={handleExpenseChange}
                    className="input-ui"
                  />

                  <input
                    name="expensePrice"
                    type="number"
                    min="0"
                    placeholder="Price"
                    value={session.expensePrice}
                    onChange={handleExpenseChange}
                    className="input-ui"
                  />
                </div>

                <button
                  onClick={addExpense}
                  className="btn-secondary w-full mt-3 inline-flex items-center justify-center gap-2"
                >
                  <Plus size={17} />
                  Add Expense
                </button>

                {session.expenses.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {session.expenses.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/45 rounded-2xl p-3 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="font-bold text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            ₱{Number(item.price || 0).toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteExpense(item.id)}
                          className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center hover:bg-red-500/20"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white/55 rounded-2xl p-4">
                <p className="text-sm text-slate-600 font-semibold">
                  Total Bill
                </p>
                <h3 className="text-3xl font-extrabold text-orange-600 mt-1">
                  ₱{totalBillNumber.toFixed(2)}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Tower subtotal + other expenses
                </p>
              </div>

              <div className="bg-white/55 rounded-2xl p-4">
                <p className="text-sm text-slate-600 font-semibold">
                  Per Head
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  ₱{perHead}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Based on {totalPresent} present participant
                  {totalPresent === 1 ? "" : "s"}.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-soft rounded-3xl p-5">
            <h2 className="text-xl font-extrabold text-slate-900 mb-5">
              Badges
            </h2>

            <div className="space-y-3">
              <div className="bg-white/45 rounded-2xl p-3 flex items-center gap-3">
                <Crown className="text-orange-500" size={20} />
                <div>
                  <p className="font-bold text-slate-900">Top Drinker</p>
                  <p className="text-xs text-slate-600">
                    {topDrinker && Number(topDrinker.drinks || 0) > 0
                      ? topDrinker.nickname || topDrinker.firstName
                      : "No one yet"}
                  </p>
                </div>
              </div>

              <div className="bg-white/45 rounded-2xl p-3 flex items-center gap-3">
                <Flame className="text-orange-500" size={20} />
                <div>
                  <p className="font-bold text-slate-900">Most Chill</p>
                  <p className="text-xs text-slate-600">
                    {lowestDrinker
                      ? lowestDrinker.nickname || lowestDrinker.firstName
                      : "No one yet"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedParticipant &&
        createPortal(
          <div className="fixed inset-0 z-9999 bg-black/25 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-card w-full max-w-lg rounded-3xl p-6 md:p-7 max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {selectedParticipant.photo ? (
                    <img
                      src={selectedParticipant.photo}
                      alt={
                        selectedParticipant.nickname ||
                        selectedParticipant.firstName
                      }
                      className="w-20 h-20 rounded-3xl object-cover border border-white/60 shadow-lg shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-3xl bg-orange-500/15 text-orange-600 flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0">
                      {getInitials(selectedParticipant)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="text-2xl font-extrabold text-slate-900 truncate">
                      {selectedParticipant.nickname ||
                        selectedParticipant.firstName}
                    </h2>

                    <p className="text-slate-700 font-medium mt-1">
                      {selectedParticipant.firstName}{" "}
                      {selectedParticipant.middleName}{" "}
                      {selectedParticipant.lastName}
                    </p>

                    <p className="text-sm text-slate-600 mt-1">
                      {selectedParticipant.section}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedParticipant(null)}
                  className="w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center text-slate-800 hover:bg-white/80 shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 bg-white/45 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">
                  Booking Pin Location
                </p>

                <div className="flex items-start gap-2 mt-2">
                  <MapPin size={18} className="text-orange-500 shrink-0" />
                  <p className="text-sm text-slate-800 font-medium">
                    {selectedParticipant.bookingPinLocation ||
                      "No location added"}
                  </p>
                </div>
              </div>

              <div className="mt-5 bg-white/45 rounded-2xl p-5 text-center">
                <p className="text-sm text-slate-600 font-semibold">
                  Total Drinks
                </p>

                <h3 className="text-6xl font-extrabold text-orange-600 mt-2">
                  {selectedParticipant.drinks}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <button
                  onClick={() => updateDrink(selectedParticipant.id, -1)}
                  className="btn-secondary inline-flex items-center justify-center gap-2"
                >
                  <Minus size={18} />
                  Drink
                </button>

                <button
                  onClick={() => updateDrink(selectedParticipant.id, 1)}
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Drink
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {getBadges(selectedParticipant).map((badge) => (
                  <span
                    key={badge}
                    className="bg-white/60 text-slate-800 px-3 py-2 rounded-full text-xs font-bold"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}