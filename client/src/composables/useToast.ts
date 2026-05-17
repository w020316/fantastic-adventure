import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

const message = ref('')
const visible = ref(false)
const toastType = ref<ToastType>('info')
let timer: ReturnType<typeof setTimeout> | null = null

const typeStyles: Record<ToastType, string> = {
  success: 'border-l-amber bg-amber/10 text-amber-light',
  error: 'border-l-red-400 bg-red-500/10 text-red-300',
  warning: 'border-l-yellow-400 bg-yellow-500/10 text-yellow-300',
  info: 'border-l-blue-400 bg-blue-500/10 text-blue-300',
}

const typeIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

export function useToast() {
  function show(msg: string, duration = 2500, type: ToastType = 'success') {
    message.value = msg
    visible.value = true
    toastType.value = type
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { visible.value = false }, duration)
  }

  return { message, visible, show, toastType, typeStyles, typeIcons }
}
