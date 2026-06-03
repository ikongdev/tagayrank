import { useEffect, useState } from "react";
import {
  Search,
  UserCheck,
  UserX,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function Attendance() {
  const [participants, setParticipants] = useState(() => {
    const saved = localStorage.getItem("tagayrank-participants");

    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "tagayrank-participants",
      JSON.stringify(participants)
    );
  }, [participants]);

  const updateAttendance = (id, status) => {
    setParticipants((prev) =>
      prev.map((person) =>
        person.id === id
          ? {
              ...person,
              present: status,
            }
          : person
      )
    );
  };

  const markAllPresent = () => {
    setParticipants((prev) =>
      prev.map((person) => ({
        ...person,
        present: true,
      }))
    );
  };

  const markAllAbsent = () => {
    setParticipants((prev) =>
      prev.map((person) => ({
        ...person,
        present: false,
      }))
    );
  };

  const filteredParticipants = participants.filter((person) => {
    const fullText = `
      ${person.firstName}
      ${person.middleName}
      ${person.lastName}
      ${person.nickname}
      ${person.section}
      ${person.bookingPinLocation}
    `.toLowerCase();

    return fullText.includes(search.toLowerCase());
  });

  const getInitials = (person) => {
    const first = person.firstName?.charAt(0) || "";
    const last = person.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "T";
  };

  const totalParticipants = participants.length;
  const totalPresent = participants.filter((person) => person.present).length;
  const totalAbsent = totalParticipants - totalPresent;

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">
            Mark who is present for the current TagayRank session.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={markAllPresent}
            disabled={participants.length === 0}
            className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={18} />
            Mark All Present
          </button>

          <button
            onClick={markAllAbsent}
            disabled={participants.length === 0}
            className="btn-secondary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle size={18} />
            Mark All Absent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-soft rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">
                Registered
              </p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                {totalParticipants}
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
              <p className="text-sm text-slate-600 font-semibold">Present</p>
              <h2 className="text-3xl font-extrabold text-green-600 mt-1">
                {totalPresent}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
              <UserCheck size={22} />
            </div>
          </div>
        </div>

        <div className="glass-soft rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Absent</p>
              <h2 className="text-3xl font-extrabold text-red-500 mt-1">
                {totalAbsent}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
              <UserX size={22} />
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
            placeholder="Search attendance..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-ui input-search"
          />
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="glass-soft rounded-3xl p-10 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            No participants yet
          </h2>
          <p className="text-slate-700 mt-2 font-medium">
            Add participants first before marking attendance.
          </p>
        </div>
      ) : filteredParticipants.length === 0 ? (
        <div className="glass-soft rounded-3xl p-10 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            No matching participants
          </h2>
          <p className="text-slate-700 mt-2 font-medium">
            Try searching a different name, nickname, section, or location.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredParticipants.map((person) => (
            <div
              key={person.id}
              className="glass-soft rounded-3xl p-5 transition hover:-translate-y-0.5"
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
                      {person.firstName} {person.lastName}
                    </p>

                    <p className="text-sm text-slate-600 mt-1 truncate">
                      {person.section}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-2 rounded-2xl text-xs font-extrabold shrink-0 ${
                    person.present
                      ? "bg-green-500/15 text-green-700"
                      : "bg-red-500/15 text-red-600"
                  }`}
                >
                  {person.present ? "Present" : "Absent"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => updateAttendance(person.id, true)}
                  className={`rounded-2xl py-3 font-bold text-sm inline-flex items-center justify-center gap-2 transition ${
                    person.present
                      ? "bg-green-500 text-white shadow-lg"
                      : "bg-white/60 text-slate-800 hover:bg-white/80"
                  }`}
                >
                  <UserCheck size={16} />
                  Present
                </button>

                <button
                  onClick={() => updateAttendance(person.id, false)}
                  className={`rounded-2xl py-3 font-bold text-sm inline-flex items-center justify-center gap-2 transition ${
                    !person.present
                      ? "bg-red-500 text-white shadow-lg"
                      : "bg-white/60 text-slate-800 hover:bg-white/80"
                  }`}
                >
                  <UserX size={16} />
                  Absent
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}