'use client';

import { useEffect, useState } from 'react';
import { X, Plus, ChevronUp, ChevronDown } from 'lucide-react';

type Instructor = {
    id: string;
    first_name: string;
    last_name: string;
    title?: string;
    email: string;
    description?: string;
    picture_url?: string;
    role: string;
};

type SelectedInstructor = {
    instructor_id: string;
    display_order: number;
    instructor_role: 'instructor' | 'lead_instructor' | 'teaching_assistant' | 'guest_instructor';
};

type InstructorSelectorProps = {
    selectedInstructors: SelectedInstructor[];
    onChange: (instructors: SelectedInstructor[]) => void;
};

export default function InstructorSelector({
    selectedInstructors,
    onChange,
}: InstructorSelectorProps) {
    const [availableInstructors, setAvailableInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchInstructors();
    }, []);

    const fetchInstructors = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/instructors');

            if (!response.ok) {
                throw new Error('Failed to fetch instructors');
            }

            const data = await response.json();
            setAvailableInstructors(data.instructors || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load instructors');
        } finally {
            setLoading(false);
        }
    };

    const addInstructor = (instructorId: string) => {
        const newInstructor: SelectedInstructor = {
            instructor_id: instructorId,
            display_order: selectedInstructors.length,
            instructor_role: 'instructor',
        };
        onChange([...selectedInstructors, newInstructor]);
    };

    const removeInstructor = (index: number) => {
        const updated = selectedInstructors.filter((_, i) => i !== index);
        // Reorder display_order
        const reordered = updated.map((inst, i) => ({ ...inst, display_order: i }));
        onChange(reordered);
    };

    const updateInstructorRole = (index: number, role: SelectedInstructor['instructor_role']) => {
        const updated = [...selectedInstructors];
        updated[index].instructor_role = role;
        onChange(updated);
    };

    const moveInstructor = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === selectedInstructors.length - 1) return;

        const updated = [...selectedInstructors];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap positions
        [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];

        // Update display_order
        const reordered = updated.map((inst, i) => ({ ...inst, display_order: i }));
        onChange(reordered);
    };

    const getInstructorById = (id: string) => {
        return availableInstructors.find(inst => inst.id === id);
    };

    const unselectedInstructors = availableInstructors.filter(
        inst => !selectedInstructors.some(sel => sel.instructor_id === inst.id)
    );

    if (loading) {
        return (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">Loading instructors...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-red-600 dark:text-red-400">Error: {error}</p>
                <button
                    onClick={fetchInstructors}
                    className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Selected Instructors */}
            <div className="space-y-2">
                {selectedInstructors.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        No instructors selected
                    </p>
                ) : (
                    selectedInstructors.map((selected, index) => {
                        const instructor = getInstructorById(selected.instructor_id);
                        if (!instructor) return null;

                        return (
                            <div
                                key={selected.instructor_id}
                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                                {/* Order Controls */}
                                <div className="flex flex-col gap-1">
                                    <button
                                        type="button"
                                        onClick={() => moveInstructor(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronUp size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveInstructor(index, 'down')}
                                        disabled={index === selectedInstructors.length - 1}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                </div>

                                {/* Instructor Info */}
                                <div className="flex-1">
                                    <p className="font-medium text-sm">
                                        {instructor.first_name} {instructor.last_name}
                                        {instructor.title && (
                                            <span className="ml-2 text-xs font-normal text-gray-600 dark:text-gray-400">
                                                ({instructor.title})
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {instructor.email}
                                    </p>
                                </div>

                                {/* Role Selector */}
                                <select
                                    value={selected.instructor_role}
                                    onChange={(e) =>
                                        updateInstructorRole(
                                            index,
                                            e.target.value as SelectedInstructor['instructor_role']
                                        )
                                    }
                                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                >
                                    <option value="instructor">Instructor</option>
                                    <option value="lead_instructor">Lead Instructor</option>
                                    <option value="teaching_assistant">Teaching Assistant</option>
                                    <option value="guest_instructor">Guest Instructor</option>
                                </select>

                                {/* Remove Button */}
                                <button
                                    type="button"
                                    onClick={() => removeInstructor(index)}
                                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Instructor Dropdown */}
            {unselectedInstructors.length > 0 && (
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Add Instructor
                    </label>
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                addInstructor(e.target.value);
                                e.target.value = '';
                            }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                        defaultValue=""
                    >
                        <option value="" disabled>
                            Select an instructor...
                        </option>
                        {unselectedInstructors.map(inst => (
                            <option key={inst.id} value={inst.id}>
                                {inst.first_name} {inst.last_name}
                                {inst.title && ` - ${inst.title}`} ({inst.email})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {availableInstructors.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No instructors available. Please create instructors first.
                </p>
            )}
        </div>
    );
}
