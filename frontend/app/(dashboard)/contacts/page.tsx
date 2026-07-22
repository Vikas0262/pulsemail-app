"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { logout } from "@/lib/auth";
import { validateContactInput } from "@/lib/validation";

type Contact = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  tags: string[];
  customFields: Record<string, string>;
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  city: "",
  tags: "",
  customKey: "",
  customValue: "",
};

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [csv, setCsv] = useState<File | null>(null);

  async function loadContacts() {
    try {
      setError("");
      const data = await api.getContacts();
      setContacts(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load contacts";
      if (message === "Unauthorized") {
        logout();
        router.push("/login");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContacts();
  }, []);

  function buildCustomFields() {
    if (!form.customKey.trim() || !form.customValue.trim()) return {};
    return { [form.customKey.trim()]: form.customValue.trim() };
  }

  async function saveContact() {
    const validationError = validateContactInput(form.email, form.phone);
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      name: form.name.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      city: form.city.trim() || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      customFields: editing
        ? { ...(editing.customFields || {}), ...buildCustomFields() }
        : buildCustomFields(),
    };

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (editing) {
        await api.updateContact(editing.id, payload);
        setSuccess("Contact updated");
      } else {
        await api.createContact(payload);
        setSuccess("Contact added");
      }

      setForm(emptyForm);
      setEditing(null);
      await loadContacts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save contact");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(contact: Contact) {
    setEditing(contact);
    setForm({
      name: contact.name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      city: contact.city || "",
      tags: (contact.tags || []).join(", "),
      customKey: "",
      customValue: "",
    });
  }

  async function deleteContact(id: number) {
    if (!confirm("Delete this contact?")) return;
    try {
      setError("");
      await api.deleteContact(id);
      setSuccess("Contact deleted");
      await loadContacts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete contact");
    }
  }

  async function uploadCSV() {
    if (!csv) {
      setError("Choose a CSV file first");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      const result = await api.uploadCSV(csv);
      setCsv(null);
      await loadContacts();
      setSuccess(result.message || `${result.added} added, ${result.skipped} skipped as duplicates`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to import contacts");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <div className="page-title">Loading contacts…</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">Manage your audience and import from CSV</p>
        </div>
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          {contacts.length} total
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">{editing ? "Edit contact" : "Add contact"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="input" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <input className="input" placeholder="Custom field key" value={form.customKey} onChange={(e) => setForm({ ...form, customKey: e.target.value })} />
          <input className="input" placeholder="Custom field value" value={form.customValue} onChange={(e) => setForm({ ...form, customValue: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={saveContact} disabled={submitting}>
            {submitting ? "Saving…" : editing ? "Update contact" : "Add contact"}
          </button>
          {editing && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-2">Import CSV</h2>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
          Use <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">mock-data/contacts.csv</code> to test. Extra columns become custom fields. Duplicates are skipped and reported.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <input type="file" accept=".csv" onChange={(e) => setCsv(e.target.files?.[0] || null)} />
          <button className="btn btn-primary" onClick={uploadCSV} disabled={uploading}>
            {uploading ? "Importing…" : "Import CSV"}
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Tags</th>
              <th>Custom</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">No contacts yet</td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>{contact.name || "—"}</td>
                  <td>{contact.email || "—"}</td>
                  <td>{contact.phone || "—"}</td>
                  <td>{contact.city || "—"}</td>
                  <td>{contact.tags?.length ? contact.tags.join(", ") : "—"}</td>
                  <td className="text-xs" style={{ color: "var(--muted)" }}>
                    {contact.customFields && Object.keys(contact.customFields).length
                      ? Object.entries(contact.customFields).map(([k, v]) => `${k}: ${v}`).join(", ")
                      : "—"}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary text-xs py-1 px-2" onClick={() => startEdit(contact)}>Edit</button>
                      <button className="btn btn-danger text-xs py-1 px-2" onClick={() => deleteContact(contact.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
