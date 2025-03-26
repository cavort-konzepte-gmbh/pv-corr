import React, { useState, useEffect } from 'react';
import { Theme } from '../../types/theme';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Plus, Edit2, X, Save } from 'lucide-react';
import { generateHiddenId } from '../../utils/generateHiddenId';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface FoundationsManagementProps {
  currentTheme: Theme;
  onBack: () => void;
}

interface Foundation {
  id: string;
  hidden_id: string;
  name: string;
}

const FoundationsManagement: React.FC<FoundationsManagementProps> = ({ currentTheme, onBack }) => {
  const [foundations, setFoundations] = useState<Foundation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFoundation, setEditingFoundation] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [isNewFoundation, setIsNewFoundation] = useState(false);
  const [newFoundation, setNewFoundation] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('foundations')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFoundations(data || []);
    } catch (err) {
      console.error('Error loading foundations:', err);
      setError('Failed to load foundations');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEditingValues = (name: string, value: string) => {
    setEditingValues(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleChangeFoundation = (name: string, value: string) => {
    setNewFoundation(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetValues = () => {
    setEditingValues({});
    setEditingFoundation(null);
  };

  const handleUpdateSaveFoundation = async (foundation: Foundation) => {
    if (editingFoundation === foundation.id) {
      try {
        const { error } = await supabase
          .from('foundations')
          .update({ 
            name: editingValues.name
          })
          .eq('id', foundation.id);

        if (error) throw error;
        await loadData();
        resetValues();
      } catch (err) {
        console.error('Error updating foundation:', err);
        setError('Failed to update foundation');
      }
    } else {
      setEditingFoundation(foundation.id);
      setEditingValues(foundation as any);
      setNewFoundation({});
      setIsNewFoundation(false);
    }
  };

  const handleDeleteFoundation = async (foundationId: string) => {
    try {
      const { error } = await supabase
        .from('foundations')
        .delete()
        .eq('id', foundationId);

      if (error) throw error;
      await loadData();
    } catch (err) {
      console.error('Error deleting foundation:', err);
      setError('Failed to delete foundation');
    }
  };

  const handleOpenFoundation = () => {
    resetValues();
    setIsNewFoundation(true);
  };

  const handleAddNewFoundation = async () => {
    try {
      if (!newFoundation.name?.trim()) {
        setError('Foundation name is required');
        return;
      }

      const { error } = await supabase
        .from('foundations')
        .insert({
          name: newFoundation.name.trim(),
          hidden_id: generateHiddenId()
        });

      if (error) throw error;
      await loadData();
      resetValues();
      setNewFoundation({});
      setIsNewFoundation(false);
    } catch (err) {
      console.error('Error creating foundation:', err);
      setError('Failed to create foundation');
    }
  };

  const handleCancelNewFoundation = () => {
    resetValues();
    setNewFoundation({});
    setIsNewFoundation(false);
  };

  return (
    <div className="p-8">
      {error && (
        <div className="p-4 mb-4 rounded text-accent-primary border-accent-primary border-solid bg-surface">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={onBack}
          variant="ghost"
        >
          <ArrowLeft className="text-primary" size={20} />
        </Button>
        <h2 className="text-2xl font-bold text-primary">
          Foundations Management
        </h2>
      </div>

      {loading ? (
        <div className="text-center p-4 text-primary">
          Loading foundations...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg text-primary">
              Foundations
            </h3>
            <Button
              onClick={handleOpenFoundation}
              className="px-3 py-1"
            >
              <Plus size={14} />
              Add Foundation
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Foundations</TableCaption>
              <TableHeader>
                <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Actions</TableHead>
                </TableRow>
               
              </TableHeader>
              <TableBody>


         
         
                {foundations.map((foundation) => (
                  <TableRow key={foundation.id}>
                    <TableCell className="p-2">
                      {editingFoundation === foundation.id ? (
                        <Input
                          type="text"
                          name="name"
                          value={editingValues.name || ''}
                          onChange={(e) => handleChangeEditingValues(e.target.name, e.target.value)}
                          className="w-full p-1 rounded text-sm text-primary border-theme border-solid bg-surface"
                        />
                      ) : (
                        foundation.name
                      )}
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="flex items-center justify-start gap-2">
                        <Button
                          onClick={() => handleUpdateSaveFoundation(foundation)}
                          className="p-1 rounded hover:bg-opacity-80 text-primary"
                          variant="ghost"
                        >
                          {editingFoundation === foundation.id ? (
                            <Save size={14} />
                          ) : (
                            <Edit2 size={14} />
                          )}
                        </Button>
                        <Button onClick={() => handleDeleteFoundation(foundation.id)} variant="ghost">
                          <X className="text-primary" size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {isNewFoundation && (
                  <TableRow>
                    <TableCell className="p-2">
                      <Input
                        type="text"
                        name="name"
                        value={newFoundation.name || ''}
                        onChange={(e) => handleChangeFoundation(e.target.name, e.target.value)}
                        className="w-full p-1"
                        placeholder="Enter foundation name"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="flex items-center justify-start gap-2">
                        <Button onClick={handleAddNewFoundation} variant="ghost">
                          <Save className="text-primary" size={14} />
                        </Button>
                        <Button onClick={handleCancelNewFoundation} variant="ghost">
                          <X className="text-primary" size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                 </TableBody>

                 </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoundationsManagement;