import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, MapPin, Beer, Search, Pencil } from "lucide-react";

const emptyForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  nickname: "",
  section: "",
  bookingPinLocation: "",
};

export default function Participants() {
  const [participants, setParticipants] = useState(() => {
    const saved = localStorage.getItem("tagayrank-participants");

    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "tagayrank-participants",
      JSON.stringify(participants)
    );
  }, [participants]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (person) => {
    setEditingId(person.id);

    setForm({
      firstName: person.firstName || "",
      middleName: person.middleName || "",
      lastName: person.lastName || "",
      nickname: person.nickname || "",
      section: person.section || "",
      bookingPinLocation: person.bookingPinLocation || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.firstName || !form.lastName || !form.section) {
      alert("Please fill out First Name, Last Name, and Section.");
      return;
    }

    if (editingId) {
      setParticipants((prev) =>
        prev.map((person) =>
          person.id === editingId
            ? {
                ...person,
                ...form,
              }
            : person
        )
      );
    } else {
      const newParticipant = {
        id: crypto.randomUUID(),
        ...form,
        present: false,
        drinks: 0,
        badges: [],
      };

      setParticipants((prev) => [...prev, newParticipant]);
    }

    closeModal();
  };

  const handleDelete = (id) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this participant?"
    );

    if (!confirmDelete) return;

    setParticipants((prev) => prev.filter((person) => person.id !== id));
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

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Participants</h1>
          <p className="page-subtitle">
            Add, edit, and manage people joining the session.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn-primary inline-flex items-center gap-2 justify-center"
        >
          <Plus size={18} />
          Add Participant
        </button>
      </div>

      <div className="glass-soft rounded-[28px] p-4 mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search participants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-ui input-search"
          />
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="glass-soft rounded-[28px] p-10 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            No participants yet
          </h2>
          <p className="text-slate-700 mt-2 font-medium">
            Add your first participant to start using TagayRank.
          </p>
        </div>
      ) : filteredParticipants.length === 0 ? (
        <div className="glass-soft rounded-[28px] p-10 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            No matching participants
          </h2>
          <p className="text-slate-700 mt-2 font-medium">
            Try searching another name, nickname, section, or location.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredParticipants.map((person) => (
            <div
              key={person.id}
              className="glass-soft rounded-[28px] p-5 transition hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {person.nickname || person.firstName}
                  </h2>

                  <p className="text-sm text-slate-700 mt-1 font-medium">
                    {person.section}
                  </p>
                </div>

                <div className="bg-white/70 text-orange-600 rounded-2xl px-3 py-2 text-sm font-bold flex items-center gap-2 shadow-sm">
                  <Beer size={16} />
                  {person.drinks}
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">
                    Full Name
                  </p>
                  <p className="text-sm text-slate-800 mt-1 font-medium">
                    {person.firstName} {person.middleName} {person.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">
                    Booking Pin Location
                  </p>

                  <div className="flex items-start gap-2 mt-1">
                    <MapPin
                      size={16}
                      className="text-orange-500 mt-0.5 shrink-0"
                    />

                    <p className="text-sm text-slate-800 font-medium">
                      {person.bookingPinLocation || "No location added"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={() => openEditModal(person)}
                  className="
                    flex-1
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    bg-white/60
                    text-slate-800
                    rounded-2xl
                    py-3
                    text-sm
                    font-bold
                    hover:bg-white/80
                    transition
                  "
                >
                  <Pencil size={16} />
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(person.id)}
                  className="
                    flex-1
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    bg-red-500/10
                    text-red-600
                    rounded-2xl
                    py-3
                    text-sm
                    font-bold
                    hover:bg-red-500/20
                    transition
                  "
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-9999 bg-black/25 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-card w-full max-w-xl rounded-4xl p-6 md:p-7 max-h-[90vh] overflow-y-auto my-auto">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {editingId ? "Edit Participant" : "Add Participant"}
              </h2>

              <p className="text-slate-700 mt-1 mb-6 font-medium">
                {editingId
                  ? "Update this participant's details."
                  : "Enter participant details for this session."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  className="input-ui"
                />

                <input
                  name="middleName"
                  placeholder="Middle Name"
                  value={form.middleName}
                  onChange={handleChange}
                  className="input-ui"
                />

                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  className="input-ui"
                />

                <input
                  name="nickname"
                  placeholder="Nickname"
                  value={form.nickname}
                  onChange={handleChange}
                  className="input-ui"
                />

                <div className="md:col-span-2">
                  <input
                    name="section"
                    placeholder="Section"
                    value={form.section}
                    onChange={handleChange}
                    className="input-ui"
                  />
                </div>

                <div className="md:col-span-2">
                  <textarea
                    name="bookingPinLocation"
                    placeholder="Booking Pin Location"
                    value={form.bookingPinLocation}
                    onChange={handleChange}
                    className="input-ui min-h-27.5 resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button onClick={handleSave} className="btn-primary flex-1">
                  {editingId ? "Save Changes" : "Save Participant"}
                </button>

                <button onClick={closeModal} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}