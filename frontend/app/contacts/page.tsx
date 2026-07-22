"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [csv, setCsv] = useState<File | null>(null);

  async function loadContacts() {
    try {
      const data = await api.getContacts();
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContacts();
  }, []);

  async function addContact() {
    if (!name || !email) return;

    await api.createContact({
      name,
      email,
    });

    setName("");
    setEmail("");

    loadContacts();
  }

  async function deleteContact(id: number) {
    await api.deleteContact(id);

    loadContacts();
  }

  async function uploadCSV() {
    if (!csv) return;

    await api.uploadCSV(csv);

    setCsv(null);

    loadContacts();
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>

      <h1 className="text-3xl font-bold mb-8">
        Contacts
      </h1>

      <div className="flex gap-3 mb-8">

        <input
          placeholder="Name"
          className="border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={addContact}
          className="bg-blue-600 text-white px-5 rounded"
        >
          Add
        </button>

      </div>

      <div className="mb-8 flex gap-4">

        <input
          type="file"
          accept=".csv"
          onChange={(e) =>
            setCsv(e.target.files?.[0] || null)
          }
        />

        <button
          onClick={uploadCSV}
          className="bg-green-600 text-white px-4 rounded"
        >
          Upload CSV
        </button>

      </div>

      <table className="w-full border">

        <thead>

          <tr className="bg-gray-200">

            <th className="border p-3">ID</th>

            <th className="border p-3">Name</th>

            <th className="border p-3">Email</th>

            <th className="border p-3">Action</th>

          </tr>

        </thead>

        <tbody>

          {contacts.map((contact) => (

            <tr key={contact.id}>

              <td className="border p-3">
                {contact.id}
              </td>

              <td className="border p-3">
                {contact.name}
              </td>

              <td className="border p-3">
                {contact.email}
              </td>

              <td className="border p-3">

                <button
                  onClick={() =>
                    deleteContact(contact.id)
                  }
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}