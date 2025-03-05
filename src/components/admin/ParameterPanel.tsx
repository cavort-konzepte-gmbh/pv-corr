import { useEffect, useState } from "react";
import { Language, useTranslation } from "../../types/language";
import { Theme } from "../../types/theme";
import { fetchParameters, Parameter, createParameter, deleteParameter, updateParameter } from "../../services/parameters";
import { Edit2, Plus, Save, X, Code, Check } from 'lucide-react';
import { FormHandler, FormInput, FormSelect, DeleteConfirmDialog } from '../shared/FormHandler';

interface RatingLogicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme;
  parameterId: string;
  initialCode: string;
  initialTestCases: string;
  onSave: (code: string, testCases: string) => void;
}

const RatingLogicDialog: React.FC<RatingLogicDialogProps> = ({
  isOpen,
  onClose,
  currentTheme,
  parameterId,
  initialCode,
  initialTestCases,
  onSave
}) => {
  const [code, setCode] = useState(initialCode || '');
  const [testCases, setTestCases] = useState(initialTestCases || '');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    try {
      // Validate test cases JSON
      if (testCases) {
        JSON.parse(testCases);
      }
      onSave(code, testCases);
      onClose();
    } catch (err) {
      setError('Invalid JSON format for test cases');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-surface">
        <h3 className="text-lg mb-6 text-primary">Edit Rating Logic</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-secondary">
              Rating Logic Code
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 p-4 font-mono text-sm rounded text-primary border-theme border-solid bg-theme"
              placeholder="Enter JavaScript code for rating calculation..."
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-secondary">
              Test Cases (JSON Array)
            </label>
            <textarea
              value={testCases}
              onChange={(e) => setTestCases(e.target.value)}
              className="w-full h-32 p-4 font-mono text-sm rounded text-primary border-theme border-solid bg-theme"
              placeholder='[{"input": "5", "expected": 4}, ...]'
            />
          </div>

          {error && (
            <div className="p-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded text-sm text-white bg-accent-primary"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [editingRatingLogic, setEditingRatingLogic] = useState<string | null>(null);
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
      try {
        const updateData = {
          ...editingValues,
          orderNumber: parseFloat(editingValues.orderNumber) || 0
        };
        await updateParameter(parameter.id, updateData);
        const updatedParameters = await fetchParameters();
        setParameters(updatedParameters);
      } catch (err) {
        console.error('Error updating parameter:', err);
        setError('Failed to update parameter');
      }
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

      const createData = {
        ...newParameter,
        orderNumber: parseFloat(newParameter.orderNumber) || 0
      };

      await createParameter(createData as any);
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
                  <th className="p-2 text-left border font-normal border-theme w-16">
                    #
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Parameter Name
                  </th>
                  <th className="p-2 text-left border font-normal border-theme">
                    Short Name
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
                    Rating Logic
                  </th>
                  <th className="p-2 text-center border font-normal border-theme">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {parameters.map((parameter) => (
                  <tr key={parameter.id}>
                    <td className="p-2 border border-theme text-center">
                      {editingParameter === parameter.id ? (
                        <FormInput
                          type="number"
                          name="orderNumber"
                          value={editingValues.orderNumber || '0'}
                          onChange={(e) => handleChangeEditingValues('orderNumber', e.target.value)}
                          className="w-16 p-1 rounded text-sm text-primary border-theme border-solid bg-surface text-center"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        parameter.orderNumber
                      )}
                    </td>
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
                          onChange={(e) => handleChangeEditingValues('name', e.target.value)}
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
                          onChange={(e) => handleChangeEditingValues('shortName', e.target.value)}
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
                          onChange={(e) => handleChangeEditingValues('unit', e.target.value)}
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
                        <FormSelect
                          name="rangeType"
                          value={editingValues.rangeType || ''}
                          onChange={(e) => handleChangeEditingValues('rangeType', e.target.value)}
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
                          onChange={(e) => handleChangeEditingValues('rangeValue', e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        />
                      ) : (
                        parameter.rangeValue || '-'
                      )}
                    </td>
                    <td className="p-2 border border-theme">
                      <button
                        onClick={() => setEditingRatingLogic(parameter.id)}
                        className="p-1 rounded hover:bg-opacity-80 flex items-center gap-2 text-secondary hover:bg-theme"
                      >
                        <Code size={14} />
                        {parameter.rating_logic_code && (
                          <Check size={14} className="text-green-500" />
                        )}
                      </button>
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
                      <FormInput
                        type="number"
                        name="orderNumber"
                        value={newParameter.orderNumber || '0'}
                        onChange={(e) => handleChangeParameter('orderNumber', e.target.value)}
                        className="w-16 p-1 rounded text-sm text-primary border-theme border-solid bg-surface text-center"
                        min="0"
                        step="0.01"
                      />
                    </td>
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
      
      {editingRatingLogic && (
        <RatingLogicDialog
          isOpen={true}
          onClose={() => setEditingRatingLogic(null)}
          currentTheme={currentTheme}
          parameterId={editingRatingLogic}
          initialCode={parameters.find(p => p.id === editingRatingLogic)?.rating_logic_code || ''}
          initialTestCases={(() => {
            const param = parameters.find(p => p.id === editingRatingLogic);
            if (!param?.rating_logic_test_cases) return '';
            try {
              return JSON.stringify(param.rating_logic_test_cases, null, 2);
            } catch (err) {
              console.error('Error parsing test cases:', err);
              return '';
            }
          })()}
          onSave={async (code, testCases) => {
            try {
              const { error } = await supabase
                .from('parameters')
                .update({
                  rating_logic_code: code,
                  rating_logic_test_cases: testCases ? JSON.parse(testCases) : null
                })
                .eq('id', editingRatingLogic);

              if (error) throw error;
              const updatedParameters = await fetchParameters();
              setParameters(updatedParameters);
              setEditingRatingLogic(null);
            } catch (err) {
              console.error('Error updating rating logic:', err);
              setError('Failed to update rating logic');
            }
          }}
        />
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