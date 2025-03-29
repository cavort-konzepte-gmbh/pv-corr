import { supabase } from '../lib/supabase'
import { Notification } from '../types/security'
import { generateHiddenId } from '../utils/generateHiddenId'
import { toCase } from '../utils/cases'

export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'acknowledged_at' | 'dismissed_at'>) => {
  try {
    // Validate duration and timeout
    if (notification.duration === 'timed' && !notification.timeout) {
      throw new Error('Timeout is required for timed notifications')
    }
    if (notification.duration !== 'timed' && notification.timeout) {
      throw new Error('Timeout is only allowed for timed notifications')
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...toCase(notification, 'snakeCase'),
        hidden_id: generateHiddenId(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Error creating notification:', err)
    throw err
  }
}

export const updateNotification = async (id: string, notification: Partial<Notification>) => {
  try {
    // Validate duration and timeout
    if (notification.duration === 'timed' && notification.timeout === undefined) {
      throw new Error('Timeout is required for timed notifications')
    }
    if (notification.duration !== 'timed' && notification.timeout !== undefined) {
      throw new Error('Timeout is only allowed for timed notifications')
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({
        ...toCase(notification, 'snakeCase'),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Error updating notification:', err)
    throw err
  }
}

export const deleteNotification = async (id: string) => {
  try {
    const { error } = await supabase.from('notifications').delete().eq('id', id)

    if (error) throw error
  } catch (err) {
    console.error('Error deleting notification:', err)
    throw err
  }
}

export const acknowledgeNotification = async (id: string) => {
  try {
    const { data, error } = await supabase.rpc('acknowledge_notification', { notification_id: id })

    if (error) throw error
    return data
  } catch (err) {
    console.error('Error acknowledging notification:', err)
    throw err
  }
}

export const dismissNotification = async (id: string) => {
  try {
    const { data, error } = await supabase.rpc('dismiss_notification', { notification_id: id })

    if (error) throw error
    return data
  } catch (err) {
    console.error('Error dismissing notification:', err)
    throw err
  }
}

export const getActiveNotifications = async () => {
  try {
    const { data, error } = await supabase.rpc('get_active_notifications')

    if (error) throw error
    return data
  } catch (err) {
    console.error('Error getting active notifications:', err)
    throw err
  }
}

export const getNotificationsByType = async (type: 'info' | 'warning' | 'error') => {
  try {
    const { data, error } = await supabase.from('notifications').select('*').eq('type', type).order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (err) {
    console.error('Error getting notifications by type:', err)
    throw err
  }
}
