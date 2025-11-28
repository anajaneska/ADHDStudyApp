import React, { useEffect, useState } from "react";
import instance from "../../custom-axios/axios";

export default function TagPicker({ selectedTagIds, onTagChange }) {
  const [tags, setTags] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#4ade80");

  const userId = localStorage.getItem("userId");

  // Load all tags for the user
  const fetchTags = async () => {
    try {
      const res = await instance.get(`/tags/${userId}`);
      setTags(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching tags:", err);
      setTags([]);
    }
  };

  useEffect(() => {
    if (userId) fetchTags();
  }, [userId]);

  // Select or unselect tag
  const toggleTag = (tagId) => {
    const updated = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];

    onTagChange(updated);
  };

  // Create a new tag
  const createTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const res = await instance.post(`/api/tags/${userId}/create`, {
        name: newTagName,
        color: newTagColor,
      });

      const newTag = res.data;

      // Add to list
      setTags((prev) => [...prev, newTag]);

      // Auto-select the new tag
      onTagChange([...selectedTagIds, newTag.id]);

      // Reset
      setShowCreateForm(false);
      setNewTagName("");
      setNewTagColor("#4ade80");
    } catch (err) {
      console.error("Error creating tag:", err);
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-2">

      {/* SELECTED TAGS */}
      <div className="flex flex-wrap gap-2">
        {selectedTagIds.map((tagId) => {
          const tag = tags.find((t) => t.id === tagId);
          if (!tag) return null;

          return (
            <span
              key={tag.id}
              style={{
                backgroundColor: tag.color,
                padding: "2px 6px",
                borderRadius: "4px",
                color: "#fff"
              }}
              onClick={() => toggleTag(tag.id)}
              className="cursor-pointer"
            >
              {tag.name} ×
            </span>
          );
        })}
      </div>

      {/* DROPDOWN */}
      <select
        defaultValue=""
        onChange={(e) => {
          const value = e.target.value;

          if (value === "create-new") {
            setShowCreateForm(true);
          } else if (value !== "") {
            toggleTag(Number(value));
          }

          e.target.value = "";
        }}
      >
        <option value="" disabled>Select tag…</option>

        {tags
          .filter((t) => !selectedTagIds.includes(t.id))
          .map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}

        <option value="create-new">+ Create new tag</option>
      </select>

      {/* CREATE NEW TAG FORM */}
      {showCreateForm && (
        <div className="flex gap-2 items-center p-2 border rounded bg-gray-50 mt-1">
          <input
            type="text"
            placeholder="Tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="border p-1 rounded flex-1"
          />

          <input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="w-12 h-8"
          />

          <button
            onClick={createTag}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Add
          </button>

          <button
            onClick={() => setShowCreateForm(false)}
            className="px-2 py-1"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
