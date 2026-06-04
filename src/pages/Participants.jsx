import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Trash2,
  MapPin,
  Beer,
  Search,
  Pencil,
  Camera,
  X,
} from "lucide-react";
import { useAppDialog } from "../components/AppDialog";

const emptyForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  nickname: "",
  section: "",
  bookingPinLocation: "",
  photo: "",
};

const resizeImage = (file, maxSize = 400, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedImage = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedImage);
      };

      img.onerror = reject;
      img.src = event.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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

  const cameraInputRef = useRef(null);

  const { dialog, alertDialog, confirmDialog } = useAppDialog();

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

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      await alertDialog({
        title: "Invalid Photo",
        message: "Please capture or select a valid image file.",
        variant: "warning",
      });
      return;
    }

    try {
      const compressedPhoto = await resizeImage(file);

      setForm((prev) => ({
        ...prev,
        photo: compressedPhoto,
      }));
    } catch {
      await alertDialog({
        title: "Photo Error",
        message: "Something went wrong while processing the photo.",
        variant: "danger",
      });
    }

    e.target.value = "";
  };

  const removePhoto = () => {
    setForm((prev) => ({
      ...prev,
      photo: "",
    }));
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
      photo: person.photo || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.photo) {
      await alertDialog({
        title: "Photo Required",
        message: "Please add a participant photo using Open Camera before saving.",
        variant: "warning",
      });
      return;
    }

    if (!form.firstName || !form.lastName || !form.section) {
      await alertDialog({
        title: "Missing Details",
        message: "Please fill out First Name, Last Name, and Section.",
        variant: "warning",
      });
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
        answeredQuestions: 0,
        badges: [],
      };

      setParticipants((prev) => [...prev, newParticipant]);
    }

    closeModal();
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog({
      title: "Delete Participant?",
      message:
        "This participant will be removed from the app. This action cannot be undone.",
      variant: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

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

  const getInitials = (person) => {
    const first = person.firstName?.charAt(0) || "";
    const last = person.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "T";
  };

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

      <div className="glass-soft rounded-3xl p-4 mb-6">
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
        <div className="glass-soft rounded-3xl p-10 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            No participants yet
          </h2>
          <p className="text-slate-700 mt-2 font-medium">
            Add your first participant to start using TagayRank.
          </p>
        </div>
      ) : filteredParticipants.length === 0 ? (
        <div className="glass-soft rounded-3xl p-10 text-center">
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
                      {person.section}
                    </p>
                  </div>
                </div>

                <div className="bg-white/70 text-orange-600 rounded-2xl px-3 py-2 text-sm font-bold flex items-center gap-2 shadow-sm shrink-0">
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

      {dialog}

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

              <div className="flex flex-col items-center mb-6">
                {form.photo ? (
                  <div className="relative">
                    <img
                      src={form.photo}
                      alt="Participant preview"
                      className="w-28 h-28 rounded-3xl object-cover border border-white/60 shadow-lg"
                    />

                    <button
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-3xl bg-orange-500/15 text-orange-600 flex items-center justify-center font-extrabold text-3xl shadow-sm">
                    {form.firstName?.charAt(0) || "T"}
                    {form.lastName?.charAt(0) || "R"}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn-secondary w-full mt-4 inline-flex items-center justify-center gap-2"
                >
                  <Camera size={18} />
                  Open Camera
                </button>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                <p className="text-xs text-slate-600 mt-3 text-center">
                  A participant photo is required. On mobile, this opens the
                  camera. On laptop, it may open the file picker.
                </p>
              </div>

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
                    className="input-ui min-h-28 resize-none"
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