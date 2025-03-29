import React, { ReactNode } from 'react'
import { useKeyAction } from '../../hooks/useKeyAction'
import { Input } from '../ui/input'

interface FormHandlerProps {
  children: ReactNode
  isEditing: boolean
  onSave: () => void
  onCancel?: () => void
  debounceTime?: number
}

export const FormHandler: React.FC<FormHandlerProps> = ({ children, isEditing, onSave, onCancel, debounceTime = 500 }) => {
  useKeyAction(
    () => {
      onSave()
    },
    isEditing,
    'Enter',
    debounceTime,
  )

  useKeyAction(
    () => {
      if (onCancel) onCancel()
    },
    isEditing,
    'Escape',
    debounceTime,
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault() // Prevent form submission
        }
      }}
    >
      {children}
    </form>
  )
}

export const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <Input
      {...props}
      className={`w-full p-2 rounded text-sm text-primary  ${props.className || ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault() // Prevent form submission
        }
        props.onKeyDown?.(e)
      }}
    />
  )
}

export const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => {
  return (
    <select
      {...props}
      className={`w-full p-2 rounded text-sm  " ${props.className || ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault() // Prevent form submission
        }
        props.onKeyDown?.(e)
      }}
    />
  )
}

export const DeleteConfirmDialog: React.FC<{
  isOpen: boolean
  itemName: string
  confirmName: string
  onConfirmChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
}> = ({ isOpen, itemName, confirmName, onConfirmChange, onConfirm, onCancel }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="p-6 rounded-lg max-w-md w-full bg-surface">
        <h3 className="text-lg mb-4 text-primary">Delete {itemName}</h3>
        <p className="mb-4 text-secondary">
          This action cannot be undone. Please type the {itemName.toLowerCase()} name to confirm deletion.
        </p>
        <div className="space-y-4">
          <FormInput
            type="text"
            value={confirmName}
            onChange={(e) => onConfirmChange(e.target.value)}
            placeholder={`Type ${itemName.toLowerCase()} name to confirm`}
          />
          <div className="flex justify-end gap-2">
            <button onClick={onCancel} className="px-4 py-2 rounded text-sm text-secondary border-theme border-solid bg-transparent">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!confirmName}
              className="px-4 py-2 rounded text-sm text-white bg-accent-primary disabled:opacity-50"
            >
              Delete {itemName}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
