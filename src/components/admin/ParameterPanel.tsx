import { useEffect, useState } from "react";
import { Language, useTranslation } from "../../types/language";
import { Theme } from "../../types/theme";
import { fetchParameters, Parameter, createParameter, deleteParameter, updateParameter } from "../../services/parameters";
import { Edit2, Plus, Save, X } from "lucide-react";
import { FormHandler, FormInput, FormSelect, DeleteConfirmDialog } from '../shared/FormHandler';

interface ParameterPanelProps {
  currentTheme: Theme;
  currentLanguage: Language;
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({ currentTheme, currentLanguage }) => {
  const t = useTranslation(currentLanguage);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingParameter, setEditingParameter] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [isNewParameter, setIsNewParameter] = useState<boolean>(false);
  const [newParameter, setNewParameter] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const translation = useTranslation(currentLanguage);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const fetchedParameters = await fetchParameters();
        setParameters(fetchedParameters);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChangeEditingValues = (name: string, value: string) => {
    setEditingValues(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleChangeParameter = (name: string, value: string) => {
    setNewParameter(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetValues = () => {
    setEditingValues({});
    setEditingParameter(null);
  };

  const handleUpdateSaveParameter = async (parameter: any) => {
    if (editingParameter === parameter.id) {
      await updateParameter(parameter.id, editingValues);
      const updatedParameters = await fetchParameters();
      setParameters(updatedParameters);
      resetValues();
    } else {
      setEditingParameter(parameter.id);
      setEditingValues(parameter);
      setNewParameter({});
      setIsNewParameter(false);
    }
  };

  const handleDeleteParameter = async (parameterId: string) => {
    // Get parameter name for confirmation
    const parameter = parameters.find(p => p.id === parameterId);
    if (!parameter) return;

    // Only proceed if name matches
    if (deleteConfirmName !== parameter.name) {
      setError('Parameter name does not match');
      return;
    }

    await deleteParameter(parameterId);
    const updatedParameters = await fetchParameters();
    setParameters(updatedParameters);
    setDeleteConfirm(null);
    setDeleteConfirmName('');
  };

  const handleOpenParameter = () => {
    resetValues();
    setIsNewParameter(true);
  };

  const handleAddNewParameter = async () => {
    try {
      if (!newParameter.rangeType) {
        setError('Range type is required');
        return;
      }

      const newParam = await createParameter(newParameter);
      const updatedParameters = await fetchParameters();
      setParameters(updatedParameters);
      resetValues();
      setNewParameter({});
      setIsNewParameter(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelNewParameter = () => {
    resetValues();
    setNewParameter({});
    setIsNewParameter(false);
  };

  return (
    <div className="p-6">
      {loading ? (
        <div className="text-center p-4 text-secondary">
          {t("datapoint.loading")}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg text-primary">
              Parameters
            </h3>
            <button
              onClick={handleOpenParameter}
              className="px-3 py-1 rounded text-sm flex items-center gap-2 text-white bg-accent-primary"
            >
              <Plus size={14} />
              Add Parameter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-theme text-primary">
              <thead>
                <tr>
                  <th className="p-2 text-left border font-normal border-theme">
                    Name
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Unit
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Range Type
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Range Value
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Short Name
                  </th>
                  <th className="p-2 text-center border font-normal border-theme">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {parameters.map((parameter) => (
                  <tr key={parameter.id}>
                    <td className="p-2 border border-theme">
                      {editingParameter === parameter.id ? (
                        <FormHandler
                          isEditing={true}
                          onSave={() => handleUpdateSaveParameter(parameter)}
                        >
                        <FormInput
                          type="text"
                          name="name"
                          value={editingValues.name || ''}
                          onChange={(e) => handleChangeEditingValues(e.target.name, e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        />
                        </FormHandler>
                      ) : (
                        parameter.name
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      {editingParameter === parameter.id ? (
                        <FormInput
                          type="text"
                          name="shortName"
                          value={editingValues.shortName || ''}
                          onChange={(e) => handleChangeEditingValues(e.target.name, e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        />
                      ) : (
                        parameter.shortName || '-'
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      {editingParameter === parameter.id ? (
                        <FormSelect
                          name="unit"
                          value={editingValues.unit || ''}
                          onChange={(e) => handleChangeEditingValues(e.target.name, e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        >
                          <option value="">No unit</option>
                          <option value="Ohm.m">Ohm.m</option>
                          <option value="Ohm.cm">Ohm.cm</option>
                          <option value="mmol/kg">mmol/kg</option>
                          <option value="mg/kg">mg/kg</option>
                          <option value="g/mol">g/mol</option>
                          <option value="mg/mmol">mg/mmol</option>
                          <option value="%">%</option>
                          <option value="ppm">ppm</option>
                          <option value="V">V</option>
                          <option value="mV">mV</option>
                          <option value="A">A</option>
                          <option value="mA">mA</option>
                        </FormSelect>
                      ) : (
                        parameter.unit || '-'
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      {editingParameter === parameter.id ? (
                        <FormInput
                          type="text"
                          name="rangeType"
                          value={editingValues.rangeType || ''}
                          onChange={(e) => handleChangeEditingValues(e.target.name, e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        />
                      ) : (
                        parameter.rangeType
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      {editingParameter === parameter.id ? (
                        <FormInput
                          type="text"
                          name="rangeValue"
                          value={editingValues.rangeValue || ''}
                          onChange={(e) => handleChangeEditingValues(e.target.name, e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        />
                      ) : (
                        parameter.rangeValue
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleUpdateSaveParameter(parameter)}
                          className="p-1 rounded hover:bg-opacity-80 text-secondary"
                        >
                          {editingParameter === parameter.id ? (
                            <Save size={14} />
                          ) : (
                            <Edit2 size={14} />
                          )}
                        </button>
                        {!editingParameter && (
                          <button 
                            onClick={() => {
                              setDeleteConfirm(parameter.id);
                              setDeleteConfirmName('');
                            }}
                            className="p-1 rounded hover:bg-opacity-80 text-secondary"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {isNewParameter && (
                  <tr>
                    <td className="p-2 border border-theme">
                      <FormHandler
                        isEditing={true}
                        onSave={handleAddNewParameter}
                      >
                      {isNewParameter ? (
                        <FormInput
                          type="text"
                          name="name"
                          value={newParameter.name || ''}
                          onChange={(e) => handleChangeParameter(e.target.name, e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        />
                      ) : null}
                      </FormHandler>
                    </td>
                    <td className="p-2 border border-theme">
                      {isNewParameter ? (
                        <FormInput
                          type="text"
                          name="shortName"
                          value={newParameter.shortName || ''}
                          onChange={(e) => handleChangeParameter(e.target.name, e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        />
                      ) : null}
                    </td>
                    <td className="p-2 border border-theme">
                      {isNewParameter ? (
                        <FormSelect
                          name="unit"
                          value={newParameter.unit || ''}
                          onChange={(e) => handleChangeParameter(e.target.name, e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        >
                          <option value="">No unit</option>
                          <option value="Ohm.m">Ohm.m</option>
                          <option value="Ohm.cm">Ohm.cm</option>
                          <option value="mmol/kg">mmol/kg</option>
                          <option value="mg/kg">mg/kg</option>
                          <option value="g/mol">g/mol</option>
                          <option value="mg/mmol">mg/mmol</option>
                          <option value="%">%</option>
                          <option value="ppm">ppm</option>
                          <option value="V">V</option>
                          <option value="mV">mV</option>
                          <option value="A">A</option>
                          <option value="mA">mA</option>
                        </FormSelect>
                      ) : null}
                    </td>
                    <td className="p-2 border border-theme">
                      {isNewParameter ? (
                        <FormSelect
                          value={newParameter.rangeType || ''}
                          onChange={(e) => handleChangeParameter('rangeType', e.target.value)}
                          required
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        >
                          <option value="">Select Range Type</option>
                          <option value="range">Range</option>
                          <option value="selection">Selection</option>
                          <option value="open">Open</option>
                          <option value="greater">Greater Than</option>
                          <option value="less">Less Than</option>
                          <option value="greaterEqual">Greater Than or Equal</option>
                          <option value="lessEqual">Less Than or Equal</option>
                        </FormSelect>
                      ) : null}
                    </td>
                    <td className="p-2 border border-theme">
                      {isNewParameter ? (
                        <FormInput
                          type="text"
                          name="rangeValue"
                          value={newParameter.rangeValue || ''}
                          onChange={(e) => handleChangeParameter(e.target.name, e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        />
                      ) : null}
                    </td>
                    <td className="p-2 border border-theme">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={handleAddNewParameter}>
                          <Save size={14} />
                        </button>
                        <button onClick={handleCancelNewParameter}>
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        isOpen={!!deleteConfirm}
        itemName="Parameter"
        confirmName={deleteConfirmName}
        onConfirmChange={setDeleteConfirmName}
        onConfirm={() => handleDeleteParameter(deleteConfirm!)}
        onCancel={() => {
          setDeleteConfirm(null);
          setDeleteConfirmName('');
        }}
      />
    </div>
  );
};