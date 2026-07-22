"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { logout } from "@/lib/auth";

type Contact = {
  id: number;
  name: string | null;
  email: string | null;
};

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
    let isMounted = true;

    const fetchContacts = async () => {
      try {
        const data = await api.getContacts();
        if (isMounted) {
          setContacts(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load contacts";
        if (isMounted) {
          if (message === "Unauthorized") {
            logout();
            router.push("/login");
            return;
          }
          setError(message);
          setLoading(false);
        }
      }
    };

    fetchContacts();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function addContact() {
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await api.createContact({ name: name.trim(), email: email.trim() });
      setName("");
      setEmail("");
      await loadContacts();
      setSuccess("Contact added successfully");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add contact");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteContact(id: number) {
    try {
      setError("");
      setSuccess("");
      await api.deleteContact(id);
      await loadContacts();
      setSuccess("Contact deleted successfully");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete contact");
    }
  }

  async function uploadCSV() {
    if (!csv) {
      setError("Please choose a CSV file first");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      await api.uploadCSV(csv);
      setCsv(null);
      await loadContacts();
      setSuccess("Contacts imported successfully");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to import contacts");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <h2 className="p-6">Loading...</h2>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {error && <p className="mb-4 text-red-500">{error}</p>}
      {success && <p className="mb-4 text-green-600">{success}</p>}

      <div className="flex flex-wrap gap-3 mb-8">
        <input
          placeholder="Name"
          className="border p-2 rounded min-w-[180px]"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          className="border p-2 rounded min-w-[220px]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={addContact}
          disabled={submitting}
          className="bg-blue-600 text-white px-5 py-2 rounded disabled:opacity-60"
        >
          {submitting ? "Adding..." : "Add"}
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-4 items-center">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setCsv(e.target.files?.[0] || null)}
        />

        <button
          onClick={uploadCSV}
          disabled={uploading}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload CSV"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-3 text-left">ID</th>
              <th className="border border-gray-300 p-3 text-left">Name</th>
              <th className="border border-gray-300 p-3 text-left">Email</th>
              <th className="border border-gray-300 p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={4} className="border border-gray-300 p-4 text-center text-gray-500">
                  No contacts yet
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="border border-gray-300 p-3">{contact.id}</td>
                  <td className="border border-gray-300 p-3">{contact.name}</td>
                  <td className="border border-gray-300 p-3">{contact.email}</td>
                  <td className="border border-gray-300 p-3">
                    <button
                      onClick={() => deleteContact(contact.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
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
