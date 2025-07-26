<template>
  <div 
    v-if="showModal" 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    @click.self="handleAccept"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md mx-4 border border-gray-200 dark:border-gray-700">
      <div class="text-center">
        <div class="mb-4">
          <img src="/favicon.png" alt="Multi-Agent Observability" class="w-16 h-16 mx-auto mb-3">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Multi-Agent Observability
          </h2>
          <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            This app provides real-time monitoring of multi-agent systems with sound notifications for important events.
          </p>
        </div>
        
        <div class="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
          <div class="flex items-center justify-center mb-2">
            <span class="text-2xl mr-2">🔊</span>
            <span class="text-sm font-medium text-blue-800 dark:text-blue-200">
              Sound Notifications
            </span>
          </div>
          <p class="text-xs text-blue-700 dark:text-blue-300">
            Click below to enable audio notifications for system events. You can toggle this anytime from the header.
          </p>
        </div>
        
        <button
          @click="handleAccept"
          class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          Get Started
        </button>
        
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
          This dialog will only appear once
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

// Props
interface Props {
  show: boolean;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  accept: [];
}>();

// Local state
const showModal = ref(false);

// Handle accept button click
const handleAccept = () => {
  emit('accept');
  showModal.value = false;
};

// Watch for prop changes
onMounted(() => {
  showModal.value = props.show;
});

// Update modal visibility when prop changes
watch(() => props.show, (newValue) => {
  showModal.value = newValue;
});
</script>
