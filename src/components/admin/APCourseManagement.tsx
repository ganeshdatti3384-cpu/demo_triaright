// APCourseManagement.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";

const initialForm = {
  internshipId: "",
  title: "",
  curriculum: [], // Array of topics with subtopics as { topicName, topicCount, subtopics: [{ name, link, duration }] }
  stream: "",
  providerName: "",
  instructorName: "",
  courseLanguage: "",
  certificationProvided: "",
  hasFinalExam: false
};

export default function APCourseManagement() {
  const [form, setForm] = useState(initialForm);
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // FETCH ALL ON LOAD
  useEffect(() => {
    fetchCourses();
  }, []);

  // ------ API UTILITIES -------
  const apiUrl = "/api/internships/apcourses";
  const headers = { "Authorization": "Bearer YOUR_TOKEN" };

  async function fetchCourses() {
    const res = await axios.get(apiUrl, { headers });
    setCourses(res.data.courses || []);
  }

  // CREATE
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    // curriculum must be sent as JSON string for multipart
    const postBody = {
      ...form,
      curriculum: JSON.stringify(form.curriculum)
    };

    // send as multipart/form-data if images/docs needed else application/json
    await axios.post(apiUrl, postBody, { headers });
    fetchCourses();
    setForm(initialForm);
  }

  // UPDATE
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    const putBody = {
      ...form,
      curriculum: form.curriculum // For PUT, send as array object, not string
    };
    await axios.put(`${apiUrl}/${editingId}`, putBody, { headers });
    fetchCourses();
    setForm(initialForm);
    setEditingId(null);
  }

  // DELETE
  async function handleDelete(id: string) {
    await axios.delete(`${apiUrl}/${id}`, { headers });
    fetchCourses();
  }

  // ------- FORM HANDLING -------
  function setField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(course: any) {
    setForm({
      ...course,
      curriculum: Array.isArray(course.curriculum)
        ? course.curriculum
        : JSON.parse(course.curriculum)
    });
    setEditingId(course._id || course.id);
  }

  // ------- RENDER -------
  return (
    <div>
      <h2>AP Course Management</h2>
      <form onSubmit={editingId ? handleUpdate : handleCreate}>
        <input
          placeholder="Internship ID"
          value={form.internshipId}
          onChange={e => setField("internshipId", e.target.value)}
          required
        />
        <input
          placeholder="Title"
          value={form.title}
          onChange={e => setField("title", e.target.value)}
          required
        />
        {/* Curriculum JSON Editor (can enhance further) */}
        <textarea
          placeholder="Curriculum (JSON: see API)"
          value={JSON.stringify(form.curriculum, null, 2)}
          rows={6}
          onChange={e => setField("curriculum", JSON.parse(e.target.value))}
          required
        />
        <input
          placeholder="Stream"
          value={form.stream}
          onChange={e => setField("stream", e.target.value)}
          required
        />
        <input
          placeholder="Provider Name"
          value={form.providerName}
          onChange={e => setField("providerName", e.target.value)}
          required
        />
        <input
          placeholder="Instructor Name"
          value={form.instructorName}
          onChange={e => setField("instructorName", e.target.value)}
          required
        />
        <input
          placeholder="Course Language"
          value={form.courseLanguage}
          onChange={e => setField("courseLanguage", e.target.value)}
          required
        />
        <select
          value={form.certificationProvided}
          onChange={e => setField("certificationProvided", e.target.value)}
        >
          <option value="">Certification Provided?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={!!form.hasFinalExam}
            onChange={e => setField("hasFinalExam", e.target.checked)}
          />
          Has Final Exam
        </label>
        <button type="submit">{editingId ? "Update" : "Create"} Course</button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }}>
            Cancel Edit
          </button>
        )}
      </form>
      <hr />
      <h3>Courses List</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Instructor</th>
            <th>InternshipId</th>
            <th>Stream</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course: any) => (
            <tr key={course._id || course.id}>
              <td>{course.title}</td>
              <td>{course.instructorName}</td>
              <td>{course.internshipRef}</td>
              <td>{course.stream}</td>
              <td>
                <button onClick={() => startEdit(course)}>Edit</button>
                <button onClick={() => handleDelete(course._id || course.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
