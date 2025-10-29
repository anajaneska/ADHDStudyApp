import React from "react";

export default function FeatureMenu({ features, setFeatures }) {
  const toggleFeature = (key) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="fixed top-4 left-4 bg-white shadow-xl rounded-2xl p-4 w-64 z-50">
      <h2 className="text-lg font-semibold mb-3 text-center">Feature Menu</h2>
      {Object.keys(features || {}).map((key) => (
        <label
          key={key}
          className="flex items-center justify-between py-2 border-b last:border-none"
        >
          <span className="capitalize">{key}</span>
          <input
            type="checkbox"
            checked={features[key]}
            onChange={() => toggleFeature(key)}
            className="w-5 h-5 cursor-pointer"
          />
        </label>
      ))}
    </div>
  );
}
