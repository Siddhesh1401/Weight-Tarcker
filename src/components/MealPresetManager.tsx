import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { mealPresets } from '../data/mealPresets';

interface MealPresetManagerProps {
  mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  onClose: () => void;
}

export default function MealPresetManager({ mealType, onClose }: MealPresetManagerProps) {
  const [customPresets, setCustomPresets] = useState<string[]>([]);
  const [hiddenDefaults, setHiddenDefaults] = useState<string[]>([]);
  const [newPreset, setNewPreset] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const defaultPresets = mealPresets[mealType] || [];

  // Load custom presets and hidden defaults from localStorage
  useEffect(() => {
    const savedCustom = localStorage.getItem(`custom_presets_${mealType}`);
    if (savedCustom) {
      setCustomPresets(JSON.parse(savedCustom));
    }
    
    const savedHidden = localStorage.getItem(`hidden_defaults_${mealType}`);
    if (savedHidden) {
      setHiddenDefaults(JSON.parse(savedHidden));
    }
  }, [mealType]);

  // Save to localStorage
  const savePresets = (presets: string[]) => {
    localStorage.setItem(`custom_presets_${mealType}`, JSON.stringify(presets));
    setCustomPresets(presets);
  };

  const handleAdd = () => {
    if (newPreset.trim()) {
      const updated = [...customPresets, newPreset.trim()];
      savePresets(updated);
      setNewPreset('');
    }
  };

  const handleDelete = (index: number) => {
    const updated = customPresets.filter((_, i) => i !== index);
    savePresets(updated);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(customPresets[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const updated = [...customPresets];
      updated[editingIndex] = editValue.trim();
      savePresets(updated);
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleHideDefault = (preset: string) => {
    const updated = [...hiddenDefaults, preset];
    localStorage.setItem(`hidden_defaults_${mealType}`, JSON.stringify(updated));
    setHiddenDefaults(updated);
  };

  const visibleDefaults = defaultPresets.filter(p => !hiddenDefaults.includes(p));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Manage Presets</h2>
              <p className="text-sm text-gray-600 capitalize">{mealType} Options</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Add New Preset */}
          <div className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Add New Preset
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPreset}
                onChange={(e) => setNewPreset(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="e.g., Smoothie bowl"
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={handleAdd}
                className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Default Presets List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Default Presets</h3>
            {visibleDefaults.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                All default presets hidden
              </p>
            ) : (
              <div className="space-y-2">
                {visibleDefaults.map((preset) => (
                  <div
                    key={preset}
                    className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 flex items-center gap-2"
                  >
                    <span className="flex-1 text-sm text-gray-800">{preset}</span>
                    <button
                      onClick={() => handleHideDefault(preset)}
                      className="text-gray-500 hover:text-rose-600 p-1"
                      title="Hide this preset"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Presets List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Custom Presets</h3>
            {customPresets.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No custom presets yet. Add one above!
              </p>
            ) : (
              <div className="space-y-2">
                {customPresets.map((preset, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-200 rounded-lg p-3 flex items-center gap-2"
                  >
                    {editingIndex === index ? (
                      <>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                          className="flex-1 px-3 py-1 border-2 border-emerald-500 rounded focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="text-emerald-600 hover:text-emerald-700 p-1"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-700 p-1"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm text-gray-800">{preset}</span>
                        <button
                          onClick={() => handleEdit(index)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-rose-600 hover:text-rose-700 p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
