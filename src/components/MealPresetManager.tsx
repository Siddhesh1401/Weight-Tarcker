import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Loader2 } from 'lucide-react';
import { mealPresets } from '../data/mealPresets';
import { templatesApi, settingsApi } from '../services/api';
import { MealTemplate } from '../types';

interface MealPresetManagerProps {
  mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  onClose: () => void;
  isOnline: boolean;
}

export default function MealPresetManager({ mealType, onClose, isOnline }: MealPresetManagerProps) {
  const [customPresets, setCustomPresets] = useState<MealTemplate[]>([]);
  const [hiddenDefaults, setHiddenDefaults] = useState<string[]>([]);
  const [newPreset, setNewPreset] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const defaultPresets = mealPresets[mealType] || [];

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Load custom presets from backend
  useEffect(() => {
    const loadPresets = async () => {
      if (!isOnline) {
        // Load from localStorage if offline
        const savedCustom = localStorage.getItem(`custom_presets_${mealType}`);
        if (savedCustom) {
          const localPresets = JSON.parse(savedCustom);
          setCustomPresets(localPresets.map((name: string, index: number) => ({
            id: `local_${index}`,
            name,
            mealType,
            description: name,
            isFavorite: false,
            useCount: 0
          })));
        }
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // First, try to load from backend
        const templates = await templatesApi.getTemplates(mealType);
        
        // Check localStorage for presets that might need to be migrated
        const savedCustom = localStorage.getItem(`custom_presets_${mealType}`);
        if (savedCustom) {
          const localPresets: string[] = JSON.parse(savedCustom);
          const templateNames = templates.map((t: any) => t.name);
          
          // Find presets that exist in localStorage but not in backend
          const presetsToMigrate = localPresets.filter(name => !templateNames.includes(name));
          
          // Migrate them to backend
          if (presetsToMigrate.length > 0) {
            console.log('Migrating local presets to backend:', presetsToMigrate);
            for (const presetName of presetsToMigrate) {
              try {
                await templatesApi.createTemplate({
                  name: presetName,
                  meal_type: mealType,
                  description: presetName,
                  is_favorite: false
                });
              } catch (err) {
                console.error('Failed to migrate preset:', presetName, err);
              }
            }
            
            // Reload templates after migration
            const updatedTemplates = await templatesApi.getTemplates(mealType);
            setCustomPresets(updatedTemplates.map((template: any) => ({
              id: template._id,
              name: template.name,
              mealType: template.meal_type,
              description: template.description,
              isFavorite: template.is_favorite,
              useCount: template.use_count
            })));
            
            // Clear localStorage after successful migration
            localStorage.removeItem(`custom_presets_${mealType}`);
          } else {
            // No migration needed, just set the templates
            setCustomPresets(templates.map((template: any) => ({
              id: template._id,
              name: template.name,
              mealType: template.meal_type,
              description: template.description,
              isFavorite: template.is_favorite,
              useCount: template.use_count
            })));
          }
        } else {
          // No localStorage data, just use backend templates
          setCustomPresets(templates.map((template: any) => ({
            id: template._id,
            name: template.name,
            mealType: template.meal_type,
            description: template.description,
            isFavorite: template.is_favorite,
            useCount: template.use_count
          })));
        }
      } catch (error) {
        console.error('Failed to load presets:', error);
        setSyncError('Failed to connect to server. Using offline mode.');
        // Fallback to localStorage
        const savedCustom = localStorage.getItem(`custom_presets_${mealType}`);
        if (savedCustom) {
          const localPresets = JSON.parse(savedCustom);
          setCustomPresets(localPresets.map((name: string, index: number) => ({
            id: `local_${index}`,
            name,
            mealType,
            description: name,
            isFavorite: false,
            useCount: 0
          })));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPresets();

    // Load hidden defaults from backend or localStorage
    const loadHiddenPresets = async () => {
      if (!isOnline) {
        // Load from localStorage if offline
        const savedHidden = localStorage.getItem(`hidden_defaults_${mealType}`);
        if (savedHidden) {
          setHiddenDefaults(JSON.parse(savedHidden));
        }
        return;
      }

      try {
        // Load from backend
        const userSettings: any = await settingsApi.getSettings();
        if (userSettings?.hidden_presets?.[mealType]) {
          setHiddenDefaults(userSettings.hidden_presets[mealType]);
          // Also save to localStorage as backup
          localStorage.setItem(`hidden_defaults_${mealType}`, JSON.stringify(userSettings.hidden_presets[mealType]));
        } else {
          // Migrate from localStorage if backend doesn't have it yet
          const savedHidden = localStorage.getItem(`hidden_defaults_${mealType}`);
          if (savedHidden) {
            const hiddenList = JSON.parse(savedHidden);
            setHiddenDefaults(hiddenList);
            // Save to backend
            const currentSettings: any = await settingsApi.getSettings();
            const updatedHiddenPresets = {
              ...currentSettings.hidden_presets,
              [mealType]: hiddenList
            };
            await settingsApi.saveSettings({ hidden_presets: updatedHiddenPresets });
          }
        }
      } catch (error) {
        console.error('Failed to load hidden presets:', error);
        // Fallback to localStorage
        const savedHidden = localStorage.getItem(`hidden_defaults_${mealType}`);
        if (savedHidden) {
          setHiddenDefaults(JSON.parse(savedHidden));
        }
      }
    };

    loadHiddenPresets();
  }, [mealType, isOnline]);

  const handleAdd = async () => {
    if (!newPreset.trim()) return;

    if (!isOnline) {
      // Save to localStorage if offline
      const currentLocal = localStorage.getItem(`custom_presets_${mealType}`);
      const localPresets = currentLocal ? JSON.parse(currentLocal) : [];
      localPresets.push(newPreset.trim());
      localStorage.setItem(`custom_presets_${mealType}`, JSON.stringify(localPresets));
      
      setCustomPresets(prev => [...prev, {
        id: `local_${Date.now()}`,
        name: newPreset.trim(),
        mealType,
        description: newPreset.trim(),
        isFavorite: false,
        useCount: 0
      }]);
      setNewPreset('');
      return;
    }

    try {
      setIsSaving(true);
      const response: any = await templatesApi.createTemplate({
        name: newPreset.trim(),
        meal_type: mealType,
        description: newPreset.trim(),
        is_favorite: false
      });

      setCustomPresets(prev => [...prev, {
        id: response._id,
        name: response.name,
        mealType: response.meal_type,
        description: response.description,
        isFavorite: response.is_favorite,
        useCount: response.use_count
      }]);
      setNewPreset('');
    } catch (error) {
      console.error('Failed to add preset:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    const preset = customPresets[index];
    
    if (!isOnline || preset.id.startsWith('local_')) {
      // Remove from localStorage if offline or local preset
      const currentLocal = localStorage.getItem(`custom_presets_${mealType}`);
      if (currentLocal) {
        const localPresets = JSON.parse(currentLocal);
        localPresets.splice(index, 1);
        localStorage.setItem(`custom_presets_${mealType}`, JSON.stringify(localPresets));
      }
      setCustomPresets(prev => prev.filter((_, i) => i !== index));
      return;
    }

    try {
      const response: any = await templatesApi.deleteTemplate(preset.id);
      if (response.success) {
        setCustomPresets(prev => prev.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(customPresets[index].name);
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null || !editValue.trim()) return;

    const preset = customPresets[editingIndex];
    
    if (!isOnline || preset.id.startsWith('local_')) {
      // Update localStorage if offline or local preset
      const currentLocal = localStorage.getItem(`custom_presets_${mealType}`);
      if (currentLocal) {
        const localPresets = JSON.parse(currentLocal);
        localPresets[editingIndex] = editValue.trim();
        localStorage.setItem(`custom_presets_${mealType}`, JSON.stringify(localPresets));
      }
      setCustomPresets(prev => prev.map((p, i) => 
        i === editingIndex ? { ...p, name: editValue.trim(), description: editValue.trim() } : p
      ));
      setEditingIndex(null);
      setEditValue('');
      return;
    }

    try {
      setIsSaving(true);
      const response: any = await templatesApi.updateTemplate(preset.id, {
        name: editValue.trim(),
        description: editValue.trim()
      });

      if (response.success) {
        setCustomPresets(prev => prev.map((p, i) => 
          i === editingIndex ? { 
            ...p, 
            name: response.data.name, 
            description: response.data.description 
          } : p
        ));
        setEditingIndex(null);
        setEditValue('');
      }
    } catch (error) {
      console.error('Failed to update preset:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleHideDefault = async (preset: string) => {
    const updated = [...hiddenDefaults, preset];
    setHiddenDefaults(updated);
    
    // Save to localStorage as backup
    localStorage.setItem(`hidden_defaults_${mealType}`, JSON.stringify(updated));
    
    // Save to backend if online
    if (isOnline) {
      try {
        const currentSettings: any = await settingsApi.getSettings();
        const updatedHiddenPresets = {
          ...currentSettings.hidden_presets,
          [mealType]: updated
        };
        await settingsApi.saveSettings({ hidden_presets: updatedHiddenPresets });
      } catch (error) {
        console.error('Failed to sync hidden presets to backend:', error);
      }
    }
  };

  const visibleDefaults = defaultPresets.filter(p => !hiddenDefaults.includes(p));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 flex items-center justify-center p-4 pt-16 pb-20 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-600 max-h-[82vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-6 border-b border-gray-100 dark:border-gray-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Manage Presets</h2>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{mealType} Options</p>
                {isOnline ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Synced
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    Offline
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-emerald-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading presets...</span>
            </div>
          ) : (
            <>
              {/* Sync Error Message */}
              {syncError && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-xl p-3">
                  <p className="text-sm text-amber-800 dark:text-amber-300">{syncError}</p>
                </div>
              )}

              {/* Add New Preset */}
              <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4 border-2 border-emerald-200 dark:border-emerald-700">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Add New Preset
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPreset}
                    onChange={(e) => setNewPreset(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="e.g., Smoothie bowl"
                    className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none"
                  />
                  <button
                    onClick={handleAdd}
                    disabled={isSaving || !newPreset.trim()}
                    className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                  </button>
                </div>
              </div>

              {/* Default Presets List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Default Presets</h3>
                {visibleDefaults.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    All default presets hidden
                  </p>
                ) : (
                  <div className="space-y-2">
                    {visibleDefaults.map((preset) => (
                      <div
                        key={preset}
                        className="bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-3 flex items-center gap-2"
                      >
                        <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">{preset}</span>
                        <button
                          onClick={() => handleHideDefault(preset)}
                          className="text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-300 p-1"
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
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Your Custom Presets</h3>
                {customPresets.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No custom presets yet. Add one above!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customPresets.map((preset, index) => (
                      <div
                        key={preset.id}
                        className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-3 flex items-center gap-2"
                      >
                        {editingIndex === index ? (
                          <>
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                              className="flex-1 px-3 py-1 border-2 border-emerald-500 dark:border-emerald-400 rounded focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                              autoFocus
                            />
                            <button
                              onClick={handleSaveEdit}
                              disabled={isSaving}
                              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 p-1 disabled:opacity-50"
                            >
                              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-400 p-1"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">{preset.name}</span>
                            <button
                              onClick={() => handleEdit(index)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(index)}
                              className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 p-1"
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
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-600 flex-shrink-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
